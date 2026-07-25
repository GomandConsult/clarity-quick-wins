
CREATE TABLE public.email_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_id UUID NOT NULL DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  report_priority TEXT,
  report_total INTEGER,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  environment TEXT,
  bcc_email TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_delivery_log_created_at ON public.email_delivery_log(created_at DESC);
CREATE INDEX idx_email_delivery_log_send_id ON public.email_delivery_log(send_id);
CREATE INDEX idx_email_delivery_log_status ON public.email_delivery_log(status);

GRANT SELECT, INSERT, UPDATE ON public.email_delivery_log TO service_role;
GRANT ALL ON public.email_delivery_log TO service_role;

ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages delivery log"
ON public.email_delivery_log
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
