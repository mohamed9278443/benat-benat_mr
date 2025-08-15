-- Verify RLS is enabled on orders table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'orders' AND schemaname = 'public';