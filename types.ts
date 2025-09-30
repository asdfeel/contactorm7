export interface FormStep {
  id: number;
  title: string;
  content: string;
}

export interface MailSettings {
  to: string;
  from: string;
  subject: string;
  headers: string;
  body: string;
}

export interface Messages {
  success: string;
  error: string;
  validation: string;
  spam: string;
  acceptance_missing: string;
  invalid_required: string;
  upload_failed_not_allowed: string;
  upload_failed: string;
  invalid_date: string;
  date_too_early: string;
  date_too_late: string;
  invalid_number: string;
  number_too_small: string;
  number_too_large: string;
  quiz_not_answered: string;
  invalid_email: string;
  invalid_url: string;
  invalid_tel: string;
  max_length: string;
  min_length: string;
}

export interface ContactForm {
  id: string;
  title: string;
  steps: FormStep[];
  mail: MailSettings;
  messages: Messages;
  multiStepSettings: {
    nextButtonText: string;
    prevButtonText: string;
  };
  conditionalFieldsSettings: {
    logic: string;
  };
  date: string;
}
