export function generateRecoveryReportBody(params: {
  username: string
  incidentTime: string
  detectedIssue: string
  userConfirmed: boolean
}) {
  const confirmation = params.userConfirmed ? 'Confirmed by account owner.' : 'Awaiting direct owner confirmation.'

  return {
    subject: 'URGENT: Possible Instagram Account Compromise',
    body: `Hello Instagram Support,\n\nOur monitoring system detected suspicious login activity on the following account:\n\nUsername: ${params.username}\nIncident time: ${params.incidentTime}\nDetected issue: ${params.detectedIssue}\nOwner confirmation: ${confirmation}\n\nWe request investigation and temporary security review of this account.\n\nRegards,\nEnCrypto Security System`,
  }
}
