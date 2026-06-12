ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS crypto_wallets jsonb DEFAULT '{}'::jsonb;
