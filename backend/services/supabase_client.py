from supabase import create_client, Client
from config import settings

# Service-role client: used ONLY inside this backend, never sent to the
# frontend. It bypasses RLS, so every write here must set uploaded_by /
# asset_id explicitly rather than relying on auth.uid().
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
