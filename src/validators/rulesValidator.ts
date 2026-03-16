import { ScannerResult } from '../analyzer/repoScanner';

export function validateRules(content: string, context: ScannerResult): string {
  // Generally rules shouldn't be too constrained, but we can verify it doesn't invent 
  // patterns we didn't authorize.
   if (content.toLowerCase().includes('microservice') && !context.patterns.includes('microservice')) {
     console.warn('[Validator] Warning: Rules mentions microservices but no microservice pattern was detected.');
   }
   
   return content;
}
