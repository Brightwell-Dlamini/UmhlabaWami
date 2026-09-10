-- ============================================================================
-- Run after approving an org if public.users is still Pending
-- Also used by the app on every approval going forward.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.activate_org_admin_on_approval(p_org_id UUID)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org organizations;
  v_user public.users;
  v_username TEXT;
BEGIN
  SELECT * INTO v_org FROM organizations WHERE id = p_org_id;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  -- Ensure org is Active (idempotent)
  UPDATE organizations
  SET status = 'Active',
      approved_at = COALESCE(approved_at, NOW())
  WHERE id = p_org_id
    AND status IS DISTINCT FROM 'Active';

  SELECT * INTO v_org FROM organizations WHERE id = p_org_id;

  v_username := lower(trim(COALESCE(
    NULLIF(v_org.preferred_username, ''),
    split_part(v_org.email, '@', 1)
  )));

  -- Activate existing profile by org id or email
  UPDATE public.users
  SET
    status = 'Active',
    role = 'admin',
    organization_id = p_org_id,
    username = COALESCE(NULLIF(username, ''), v_username),
    name = COALESCE(NULLIF(name, ''), v_org.owner_name),
    email = lower(COALESCE(NULLIF(email, ''), v_org.email))
  WHERE organization_id = p_org_id
     OR lower(email) = lower(v_org.email)
  RETURNING * INTO v_user;

  IF v_user IS NOT NULL THEN
    RETURN v_user;
  END IF;

  -- No profile yet — create Active admin row (Auth must still exist separately)
  INSERT INTO public.users (
    organization_id, username, name, email, phone, role, status
  ) VALUES (
    p_org_id,
    v_username,
    v_org.owner_name,
    lower(v_org.email),
    v_org.phone,
    'admin',
    'Active'
  )
  RETURNING * INTO v_user;

  RETURN v_user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_org_admin_on_approval(UUID) TO authenticated;

-- One-shot: activate ALL users linked to already-Active organisations
UPDATE public.users u
SET status = 'Active',
    role = CASE WHEN u.role IS NULL OR u.role = '' THEN 'admin' ELSE u.role END
FROM public.organizations o
WHERE o.id = u.organization_id
  AND o.status = 'Active'
  AND u.status IS DISTINCT FROM 'Active';

-- Also by matching org email when organization_id was never set
UPDATE public.users u
SET status = 'Active',
    role = 'admin',
    organization_id = o.id
FROM public.organizations o
WHERE lower(u.email) = lower(o.email)
  AND o.status = 'Active'
  AND (u.organization_id IS NULL OR u.status IS DISTINCT FROM 'Active');
