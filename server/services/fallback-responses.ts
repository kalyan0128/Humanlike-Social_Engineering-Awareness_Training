// This file provides fallback responses when the Groq API is unavailable

/**
 * Generates a fallback response when the Groq API is unavailable
 * @param message The user's message
 * @returns A crafted fallback response
 */
export function getFallbackResponse(message: string): string {
  // Extract keywords from the message to provide more relevant responses
  const messageLC = message.toLowerCase();
  
  // Check for common social engineering topics
  if (
    messageLC.includes('phishing') || 
    messageLC.includes('email') || 
    messageLC.includes('suspicious')
  ) {
    return `Phishing attempts often occur through emails that appear legitimate but contain suspicious links or attachments. Always verify the sender's email address, avoid clicking on unknown links, and never share sensitive information through email unless you're absolutely certain of the recipient's identity.`;
  }
  
  if (
    messageLC.includes('password') || 
    messageLC.includes('authentication') || 
    messageLC.includes('2fa') || 
    messageLC.includes('two factor')
  ) {
    return `Strong password practices are essential for cybersecurity. Use unique, complex passwords for each account, enable two-factor authentication (2FA) whenever possible, and consider using a password manager to securely store your credentials. Never share your passwords with others, even if they claim to be from IT support.`;
  }
  
  if (
    messageLC.includes('pretexting') || 
    messageLC.includes('impersonation') || 
    messageLC.includes('pretend')
  ) {
    return `Pretexting is a social engineering technique where attackers create a fabricated scenario to obtain information or access. They might impersonate colleagues, IT staff, or authority figures. Always verify someone's identity through official channels before providing sensitive information, especially when the request seems unusual or urgent.`;
  }
  
  if (
    messageLC.includes('baiting') || 
    messageLC.includes('usb') || 
    messageLC.includes('free') || 
    messageLC.includes('offer')
  ) {
    return `Baiting attacks lure victims with promises of goods, services, or exciting offers. This could be through physical items like USB drives left in public places or digital enticements like "free" downloads. Never use unknown USB devices or download software from unverified sources, regardless of how tempting the offer may seem.`;
  }
  
  if (
    messageLC.includes('quid pro quo') || 
    messageLC.includes('service') || 
    messageLC.includes('help') || 
    messageLC.includes('support')
  ) {
    return `In quid pro quo attacks, cybercriminals offer a service or assistance in exchange for information or access. They might pose as IT support staff offering to solve a problem. Always verify support requests through official channels and be suspicious of unsolicited offers of help, especially those requiring access to your systems or accounts.`;
  }
  
  if (
    messageLC.includes('scareware') || 
    messageLC.includes('warning') || 
    messageLC.includes('virus') || 
    messageLC.includes('infected')
  ) {
    return `Scareware tactics use fear to manipulate victims, often through fake alerts about viruses or security breaches. These might appear as pop-ups or emails warning about infected devices. Don't panic or rush to respond to these alerts. Instead, verify the warning through legitimate security software or contact your IT department through official channels.`;
  }
  
  if (
    messageLC.includes('social media') || 
    messageLC.includes('facebook') || 
    messageLC.includes('linkedin') || 
    messageLC.includes('twitter') || 
    messageLC.includes('instagram')
  ) {
    return `Social media platforms are common targets for social engineering attacks. Attackers may create fake profiles, send malicious links through direct messages, or gather information for targeted attacks. Be cautious about connection requests from strangers, limit the personal information you share publicly, and be skeptical of unusual messages, even from seemingly familiar contacts.`;
  }
  
  if (
    messageLC.includes('vishing') || 
    messageLC.includes('voice') || 
    messageLC.includes('call') || 
    messageLC.includes('phone')
  ) {
    return `Vishing (voice phishing) involves phone calls where attackers impersonate trusted entities to extract information. They might claim to be from your bank, government agencies, or tech support. Never provide sensitive information during unsolicited calls. Instead, hang up and call the organization directly using their official number to verify the legitimacy of the request.`;
  }
  
  if (
    messageLC.includes('deepfake') || 
    messageLC.includes('ai generated') || 
    messageLC.includes('fake video') || 
    messageLC.includes('synthetic')
  ) {
    return `Deepfake technology uses AI to create realistic but fabricated audio and video content, which can be used for social engineering attacks. To detect potential deepfakes, look for unnatural facial movements, lighting inconsistencies, or audio that doesn't match lip movements. When receiving unexpected video or audio communications, verify through another channel before taking any requested actions.`;
  }
  
  if (
    messageLC.includes('work from home') || 
    messageLC.includes('remote') || 
    messageLC.includes('home office') || 
    messageLC.includes('personal device')
  ) {
    return `Remote work environments present unique security challenges. When working from home, maintain clear separation between work and personal devices, use a VPN for sensitive operations, secure your home network with strong encryption, and be extra vigilant about phishing attempts targeting remote workers. Follow your organization's security policies for remote work.`;
  }
  
  // Default general awareness response
  return `Social engineering attacks exploit human psychology rather than technical vulnerabilities. Stay vigilant by verifying requests through alternative channels, being skeptical of urgency in messages, protecting your personal information, keeping software updated, and reporting suspicious activities. Remember that awareness is your best defense against these sophisticated manipulation techniques.`;
}