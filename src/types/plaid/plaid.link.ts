export interface PlaidLinkOnSuccessMetadata {
  institution: null | PlaidInstitution;
  accounts: Array<PlaidAccount>;
  link_session_id: string;
  transfer_status?: string;
}

interface PlaidInstitution {
  name: string;
  institution_id: string;
}

interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  verification_status: string;
}
