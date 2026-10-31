// Supabase connection for the live catalogue and the staff dashboard.
// Both values come from Supabase: Project Settings -> API.
// The anon (public) key is safe to publish: database security rules decide what it can do.
// Leave them empty to run the shop from the built-in catalogue (no dashboard).
window.BRISMART_CONFIG = {
  supabaseUrl: "https://lqszrryrpalyseqjmjcp.supabase.co",
  supabaseAnonKey: "sb_publishable_kLHHWL6iEX7Enp8dYZ_x_Q_FGCH_RAG",
};
