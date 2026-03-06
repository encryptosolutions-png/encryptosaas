import { BayesClassifier } from 'natural'
import * as fs from 'fs'
import * as path from 'path'

// Enhanced training data with more examples and categories
const SCAM_MESSAGES = [
  // Lottery/Prize scams
  "Congratulations! You've won $1,000,000! Click here to claim your prize.",
  "You have been selected as the winner of our lottery. Claim your $500,000 prize now!",
  "URGENT: You won a brand new iPhone! Pay $99 shipping to receive it.",
  "You've been randomly selected for a $10,000 cash prize. Send your details to claim.",

  // Investment/Financial scams
  "Investment opportunity: Double your money in 24 hours. Limited time offer!",
  "Bitcoin investment: Guaranteed 300% returns in one week. Don't miss out!",
  "Crypto trading bot: Make $1000 daily with zero risk. Start now!",
  "Private investment club: Join now for exclusive profits. Limited spots available.",
  "Real estate investment: Buy property with no money down. 100% financing available.",

  // Inheritance/Wealth transfer scams
  "Hi, I'm a prince from Nigeria. I need your help to transfer $50 million.",
  "Deceased relative left you $15 million. Contact lawyer for inheritance.",
  "Overseas businessman needs partner for $25 million transfer. 30% commission.",
  "Widow needs help transferring husband's $8 million estate. Will share profits.",

  // Account/Payment scams
  "Your PayPal account has been limited. Click to restore full access.",
  "Bank alert: Suspicious activity detected. Confirm your identity immediately.",
  "Amazon order: Your payment failed. Update payment method urgently.",
  "Netflix account suspended. Pay $49.99 to reactivate immediately.",
  "Credit card charged $299.99. Click to dispute this transaction.",

  // Job/Work scams
  "Work from home and earn $5000 per week. No experience required!",
  "Online job: Data entry from home. $2000/month guaranteed.",
  "Freelance opportunity: Earn $100/hour. Start immediately.",
  "Part-time job: Make money taking surveys. $50/hour possible.",

  // Package/Delivery scams
  "Your package is delayed. Pay $99.99 to expedite delivery.",
  "UPS package stuck in customs. Pay $75 processing fee to release.",
  "FedEx delivery failed. Reschedule and pay $49.99 redelivery fee.",
  "Customs clearance required. Pay $150 duty fee immediately.",

  // Government/Tax scams
  "IRS tax refund: You qualify for $1,200. Provide your bank details.",
  "Social security number verification required for benefits.",
  "Tax refund processing requires immediate action. Send payment info.",
  "Government grant approved: $5,000 available. Pay $199 processing fee.",

  // Tech Support scams
  "Microsoft support: Your computer is infected. Call this number now.",
  "Apple security alert: Your iCloud account is compromised.",
  "Windows defender: Virus detected. Download our security software.",
  "Your computer is sending error reports. Call tech support immediately.",

  // Romance scams
  "Hello beautiful, I saw your profile and I'm interested in you.",
  "I'm a wealthy businessman looking for a serious relationship.",
  "I want to send you money for your future. What's your bank details?",
  "My late husband left me $2 million. I need help transferring it.",

  // Charity scams
  "Help victims of natural disaster. Donate now to save lives.",
  "Cancer research needs your urgent donation. Every dollar helps.",
  "Children's hospital fundraiser. Your contribution can save a child.",
  "Wildlife conservation: Donate to protect endangered animals.",

  // Money transfer scams
  "Western Union transfer: Send money for collaboration fee.",
  "MoneyGram payment required for urgent business deal.",
  "Wire transfer needed for inheritance claim.",
  "Send $500 via PayPal for partnership agreement."
]

const LEGITIMATE_MESSAGES = [
  // E-commerce
  "Your order #12345 has been shipped. Track it here: amazon.com/track",
  "Thank you for your payment. Your receipt is attached.",
  "Order confirmation: Your purchase has been processed successfully.",
  "Shipping update: Your package is out for delivery.",
  "Return request approved. Label sent to your email.",

  // Banking/Finance
  "Your account balance is $1,250.32. View statement: chase.com/statement",
  "Credit card payment received. Thank you for your payment.",
  "Monthly statement available. Download from your online banking.",
  "Security alert: New device logged into your account.",
  "Password reset successful. If you didn't request this, contact support.",

  // Communication
  "Meeting scheduled for tomorrow at 2 PM. Please confirm attendance.",
  "New message from John Doe: 'Meeting at 3 PM?'",
  "Calendar invite: Team standup - March 15th at 10 AM.",
  "Email delivery delayed. Check your spam folder.",
  "Message sent successfully to all recipients.",

  // Services
  "Your flight is confirmed. Boarding pass attached.",
  "Hotel reservation confirmed. Check-in after 3 PM.",
  "Appointment confirmed for March 15th at 10 AM.",
  "Service maintenance scheduled for tonight 2-4 AM.",
  "Your subscription will renew on April 1st. Cancel anytime.",

  // Business
  "Invoice #INV-2024-001 attached. Payment due in 30 days.",
  "Quarterly report available for download.",
  "New product launch: Check out our latest features at website.com/new",
  "Welcome to our newsletter. Unsubscribe anytime at footer link.",
  "Account verification complete. Welcome to our platform!",

  // Support
  "Customer support ticket #45678 has been resolved.",
  "Thank you for your feedback. We appreciate your input.",
  "Your warranty is valid until December 2025.",
  "Technical support: Your issue has been escalated to engineering.",
  "Knowledge base article: How to reset your password.",

  // Personal
  "Happy birthday! Hope you have a wonderful day.",
  "Thank you for the gift. It was very thoughtful.",
  "Family reunion planning: Please RSVP by March 20th.",
  "Photo album shared: Spring break memories.",
  "Recipe shared: Try this new pasta dish tonight.",

  // Education
  "Assignment due Friday. Submit via online portal.",
  "Class cancelled tomorrow due to weather.",
  "Grade posted for Math 101 final exam.",
  "Library book due date: March 25th.",
  "Online course certificate available for download.",

  // Government/Legal
  "Tax return filed successfully. Refund expected in 2-3 weeks.",
  "Driver's license renewal reminder: Expires in 30 days.",
  "Court date scheduled: March 20th at 9 AM.",
  "Permit approved. Download documents from portal.",
  "Benefits application received. Processing will take 4-6 weeks."
]

// Advanced scam detection patterns with regex
const SCAM_PATTERNS = {
  // High-risk patterns (weight: 25-30 points each)
  highRisk: [
    /\b(?:won|winner|selected|chosen|recipient)\b.*?\b(?:prize|award|lottery|jackpot|million)\b/i,
    /\b(?:urgent|immediate|emergency|critical|important)\b.*?\b(?:action|response|reply|attention)\b/i,
    /\b(?:guaranteed|100% guaranteed|certain|sure|definite)\b.*?\b(?:profit|return|income|money)\b/i,
    /\b(?:wire transfer|western union|moneygram|paypal|bitcoin|crypto)\b.*?\b(?:send|transfer|pay)\b/i,
    /\b(?:bank details|account number|routing number|social security|ssn|tax id)\b/i,
    /\b(?:inheritance|estate|deceased|widow|widower|orphan)\b.*?\b(?:million|money|funds)\b/i,
    /\b(?:prince|princess|royal|noble|diplomat|official)\b.*?\b(?:nigeria|africa|overseas)\b/i,
    /\b(?:microsoft|apple|google|amazon|netflix|irs|government|fbi|cia)\b.*?\b(?:support|security|alert)\b/i,
    /\b(?:limited time|expires soon|deadline|time sensitive|act now|don't wait)\b/i,
    /\b(?:no risk|zero risk|risk free|safe investment|guaranteed return)\b/i
  ],

  // Medium-risk patterns (weight: 10-15 points each)
  mediumRisk: [
    /\b(?:investment|invest|opportunity|chance)\b.*?\b(?:double|triple|profit|return)\b/i,
    /\b(?:work from home|home based|remote work|online job)\b.*?\b(?:thousand|dollar|money)\b/i,
    /\b(?:free money|cash prize|bonus|reward|gift|present)\b/i,
    /\b(?:click here|visit link|download now|open attachment)\b/i,
    /\b(?:verify account|confirm identity|update information|security check)\b/i,
    /\b(?:package|delivery|shipment|tracking)\b.*?\b(?:delayed|stuck|held|customs)\b/i,
    /\b(?:tax refund|tax return|irs|government grant|benefit)\b/i,
    /\b(?:million|billion|thousand)\b.*?\b(?:dollar|usd|pound|euro)\b/i,
    /\b(?:congratulations|congrats|felicitation)\b.*?\b(?:won|selected|chosen)\b/i,
    /\b(?:no experience|easy money|quick cash|fast money)\b/i
  ],

  // Low-risk patterns (weight: 3-5 points each)
  lowRisk: [
    /\b(?:call now|phone number|contact us|reach out)\b/i,
    /\b(?:limited|exclusive|private|confidential)\b/i,
    /\b(?:amazing|incredible|fantastic|unbelievable)\b/i,
    /\b(?:secret|hidden|underground|private)\b/i,
    /\b(?:partnership|collaboration|joint venture)\b/i,
    /\b(?:foreign|international|overseas|abroad)\b/i,
    /\b(?:charity|donation|fundraiser|contribution)\b/i,
    /\b(?:medical|health|treatment|cure)\b/i,
    /\b(?:legal|lawyer|attorney|court)\b/i,
    /\b(?:business|company|corporation|enterprise)\b/i
  ]
}

class ScamDetector {
  private classifier: BayesClassifier
  private isTrained: boolean = false
  private modelPath: string

  constructor() {
    this.classifier = new BayesClassifier()
    this.modelPath = path.join(process.cwd(), 'scam-detector-model.json')
    this.loadModel()
  }

  private loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        const modelData = fs.readFileSync(this.modelPath, 'utf8')
        const model = JSON.parse(modelData)
        this.classifier = BayesClassifier.restore(model)
        this.isTrained = true
        console.log('Advanced scam detection model loaded successfully')
      } else {
        this.trainModel()
      }
    } catch (error) {
      console.error('Error loading model, training new one:', error)
      this.trainModel()
    }
  }

  private trainModel() {
    console.log('Training advanced scam detection model...')

    // Add training data with more examples
    SCAM_MESSAGES.forEach(message => {
      this.classifier.addDocument(message, 'scam')
    })

    LEGITIMATE_MESSAGES.forEach(message => {
      this.classifier.addDocument(message, 'legitimate')
    })

    // Train the classifier
    this.classifier.train()
    this.isTrained = true

    // Save the model
    try {
      const modelData = JSON.stringify(this.classifier)
      fs.writeFileSync(this.modelPath, modelData)
      console.log('Advanced model trained and saved successfully')
    } catch (error) {
      console.error('Error saving model:', error)
    }
  }

  analyzeMessage(message: string): {
    result: 'verified_safe' | 'likely_safe' | 'neutral' | 'needs_verification' | 'exercise_caution' | 'high_risk' | 'confirmed_scam' | 'potential_fraud' | 'dangerous'
    riskLevel: number
    matchedKeywords: string[]
    analysis: { description: string; precautions: string[] }
  } {
    if (!this.isTrained) {
      throw new Error('Model not trained yet')
    }

    // Get ML classification
    const classifications = this.classifier.getClassifications(message)
    const topClassification = classifications[0]

    // Get pattern-based risk score
    const patternRisk = this.calculatePatternRisk(message)

    // Extract keywords using advanced pattern matching
    const scamKeywords = this.extractScamKeywords(message)

    // Combine ML confidence with pattern risk
    let mlRisk = 0
    if (topClassification.label === 'scam') {
      mlRisk = Math.min(100, Math.round(topClassification.value * 100))
    }

    // Weighted combination: 60% ML, 40% pattern matching
    let combinedRisk = Math.round((mlRisk * 0.6) + (patternRisk * 0.4))

    // Boost risk if multiple keywords found
    if (scamKeywords.length >= 3) {
      combinedRisk = Math.min(100, combinedRisk + 15)
    } else if (scamKeywords.length >= 2) {
      combinedRisk = Math.min(100, combinedRisk + 10)
    }

    // Determine final result with more nuanced thresholds
    let result: 'safe' | 'suspicious' | 'scam' = 'safe'
    if (combinedRisk >= 75 || (mlRisk >= 80 && patternRisk >= 60)) {
      result = 'scam'
    } else if (combinedRisk >= 45 || mlRisk >= 60 || patternRisk >= 40) {
      result = 'suspicious'
    }

    // Generate detailed description
    let description = this.generateDetailedDescription(result, combinedRisk, mlRisk, patternRisk, scamKeywords)

    return {
      result,
      riskLevel: combinedRisk,
      matchedKeywords: scamKeywords,
      analysis: { description }
    }
  }

  private calculatePatternRisk(message: string): number {
    let totalRisk = 0

    // Check high-risk patterns
    SCAM_PATTERNS.highRisk.forEach(pattern => {
      if (pattern.test(message)) {
        totalRisk += 25
      }
    })

    // Check medium-risk patterns
    SCAM_PATTERNS.mediumRisk.forEach(pattern => {
      if (pattern.test(message)) {
        totalRisk += 12
      }
    })

    // Check low-risk patterns
    SCAM_PATTERNS.lowRisk.forEach(pattern => {
      if (pattern.test(message)) {
        totalRisk += 4
      }
    })

    // Cap at 100 and apply diminishing returns for multiple matches
    return Math.min(100, totalRisk > 80 ? 80 + (totalRisk - 80) * 0.5 : totalRisk)
  }

  private extractScamKeywords(message: string): string[] {
    const keywords = [
      // Financial terms
      'wire transfer', 'western union', 'moneygram', 'bitcoin', 'crypto', 'paypal',
      'bank details', 'account number', 'routing number', 'social security', 'ssn',
      'tax refund', 'irs', 'inheritance', 'estate', 'million', 'billion',

      // Urgency terms
      'urgent', 'immediate', 'emergency', 'critical', 'important', 'act now',
      'limited time', 'expires soon', 'deadline', 'time sensitive', 'don\'t wait',

      // Prize/Win terms
      'won', 'winner', 'selected', 'chosen', 'recipient', 'prize', 'award',
      'lottery', 'jackpot', 'congratulations', 'felicitation',

      // Investment terms
      'investment', 'invest', 'opportunity', 'guaranteed', 'profit', 'return',
      'double', 'triple', 'risk free', 'no risk', 'zero risk',

      // Scam actor terms
      'prince', 'princess', 'royal', 'noble', 'diplomat', 'official', 'widow',
      'widower', 'orphan', 'deceased', 'overseas', 'nigeria', 'africa',

      // Tech/Company impersonation
      'microsoft', 'apple', 'google', 'amazon', 'netflix', 'support', 'security',
      'alert', 'suspended', 'limited', 'locked', 'verification',

      // Action terms
      'click here', 'visit link', 'download now', 'open attachment', 'call now',
      'send money', 'transfer funds', 'pay now', 'verify account', 'confirm identity',

      // Job/Money making terms
      'work from home', 'home based', 'remote work', 'online job', 'easy money',
      'quick cash', 'fast money', 'no experience', 'guaranteed income',

      // Package/Delivery terms
      'package', 'delivery', 'shipment', 'tracking', 'delayed', 'stuck', 'held',
      'customs', 'expedite', 'processing fee', 'shipping fee'
    ]

    const lowerMessage = message.toLowerCase()
    return keywords.filter(keyword => lowerMessage.includes(keyword))
  }

  private generateDetailedDescription(
    result: string,
    combinedRisk: number,
    mlRisk: number,
    patternRisk: number,
    keywords: string[]
  ): string {
    const riskIndicators = []

    if (mlRisk >= 70) riskIndicators.push('ML model confidence')
    if (patternRisk >= 50) riskIndicators.push('pattern matching')
    if (keywords.length >= 3) riskIndicators.push('multiple red flags')

    let description = ''

    if (result === 'scam') {
      description = `🚨 High-confidence scam detected (${combinedRisk}% risk). `
      if (riskIndicators.length > 0) {
        description += `Triggered by: ${riskIndicators.join(', ')}. `
      }
      description += `This message exhibits strong scam characteristics.`
    } else if (result === 'suspicious') {
      description = `⚠️ Suspicious content detected (${combinedRisk}% risk). `
      if (riskIndicators.length > 0) {
        description += `Concerns: ${riskIndicators.join(', ')}. `
      }
      description += `This message contains some concerning elements that warrant caution.`
    } else {
      description = `✅ Message appears safe (${combinedRisk}% risk). No major scam indicators detected.`
    }

    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 5)
      description += ` Key terms: ${topKeywords.join(', ')}`
    }

    return description
  }
}

// Singleton instance
let scamDetector: ScamDetector | null = null

export function getScamDetector(): ScamDetector {
  if (!scamDetector) {
    scamDetector = new ScamDetector()
  }
  return scamDetector
}