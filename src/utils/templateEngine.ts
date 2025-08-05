import Handlebars from 'handlebars';
import type { VariableContext, TemplateVariable } from '../types/meta';

// Template Engine Class
class TemplateEngine {
  private static instance: TemplateEngine;
  private isInitialized = false;

  private constructor() {
    this.registerHelpers();
  }

  static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  // Register custom Handlebars helpers
  private registerHelpers(): void {
    if (this.isInitialized) return;

    // Location helpers
    Handlebars.registerHelper('location', function(context: any) {
      return context.location?.name || '';
    });

    Handlebars.registerHelper('locationCity', function(context: any) {
      return context.location?.city || '';
    });

    Handlebars.registerHelper('locationState', function(context: any) {
      return context.location?.state || '';
    });

    Handlebars.registerHelper('locationZip', function(context: any) {
      return context.location?.zipCode || '';
    });

    Handlebars.registerHelper('locationPhone', function(context: any) {
      return context.location?.phoneNumber || '';
    });

    Handlebars.registerHelper('locationAddress', function(context: any) {
      return context.location?.address || '';
    });

    Handlebars.registerHelper('locationUrl', function(context: any) {
      return context.location?.landingPageUrl || '';
    });

    // Campaign helpers
    Handlebars.registerHelper('campaign', function(context: any) {
      return context.campaign?.name || '';
    });

    Handlebars.registerHelper('campaignObjective', function(context: any) {
      return context.campaign?.objective || '';
    });

    Handlebars.registerHelper('campaignBudget', function(context: any) {
      return context.campaign?.budget?.toString() || '0';
    });

    Handlebars.registerHelper('campaignPlatform', function(context: any) {
      return context.campaign?.platform || '';
    });

    // Formatting helpers
    Handlebars.registerHelper('formatPhone', function(phone: string) {
      if (!phone) return '';
      
      // Remove all non-digits
      const cleaned = phone.replace(/\D/g, '');
      
      // Format as (XXX) XXX-XXXX
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      
      // Format as +X (XXX) XXX-XXXX
      if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      }
      
      return phone;
    });

    Handlebars.registerHelper('formatCurrency', function(amount: number, currency = 'USD') {
      if (typeof amount !== 'number') return '0';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });

    Handlebars.registerHelper('formatDate', function(date: string, format = 'MM/DD/YYYY') {
      if (!date) return '';
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const year = d.getFullYear();
      
      return format
        .replace('MM', month)
        .replace('DD', day)
        .replace('YYYY', year.toString());
    });

    // Conditional helpers
    Handlebars.registerHelper('conditional', function(condition: any, trueValue: string, falseValue: string) {
      return condition ? trueValue : falseValue;
    });

    Handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifNotEquals', function(arg1: any, arg2: any, options: any) {
      return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
    });

    // String manipulation helpers
    Handlebars.registerHelper('uppercase', function(str: string) {
      return str ? str.toUpperCase() : '';
    });

    Handlebars.registerHelper('lowercase', function(str: string) {
      return str ? str.toLowerCase() : '';
    });

    Handlebars.registerHelper('capitalize', function(str: string) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    });

    Handlebars.registerHelper('truncate', function(str: string, length: number) {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    });

    // Math helpers
    Handlebars.registerHelper('add', function(a: number, b: number) {
      return (a || 0) + (b || 0);
    });

    Handlebars.registerHelper('subtract', function(a: number, b: number) {
      return (a || 0) - (b || 0);
    });

    Handlebars.registerHelper('multiply', function(a: number, b: number) {
      return (a || 0) * (b || 0);
    });

    Handlebars.registerHelper('divide', function(a: number, b: number) {
      return b ? (a || 0) / b : 0;
    });

    // Array helpers
    Handlebars.registerHelper('join', function(array: any[], separator = ', ') {
      if (!Array.isArray(array)) return '';
      return array.join(separator);
    });

    Handlebars.registerHelper('first', function(array: any[]) {
      if (!Array.isArray(array) || array.length === 0) return '';
      return array[0];
    });

    Handlebars.registerHelper('last', function(array: any[]) {
      if (!Array.isArray(array) || array.length === 0) return '';
      return array[array.length - 1];
    });

    // Custom variable helper
    Handlebars.registerHelper('custom', function(key: string, context: any) {
      return context.custom?.[key] || '';
    });

    this.isInitialized = true;
  }

  // Compile template with variables
  compileTemplate(template: string, data: VariableContext): string {
    try {
      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(data);
    } catch (error) {
      console.error('Template compilation error:', error);
      return template; // Return original template if compilation fails
    }
  }

  // Validate template variables
  validateTemplate(template: string, availableVariables: string[]): {
    isValid: boolean;
    missingVariables: string[];
    errors: string[];
    warnings: string[];
  } {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const foundVariables: string[] = [];
    const missingVariables: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    let match;
    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1].trim();
      foundVariables.push(variable);

      // Check if variable is available
      if (!this.isVariableAvailable(variable, availableVariables)) {
        missingVariables.push(variable);
        errors.push(`Variable '${variable}' is not available`);
      }

      // Check for potential issues
      if (variable.includes('undefined') || variable.includes('null')) {
        warnings.push(`Variable '${variable}' may be undefined`);
      }
    }

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      errors,
      warnings
    };
  }

  // Check if a variable is available
  private isVariableAvailable(variable: string, availableVariables: string[]): boolean {
    // Check exact match
    if (availableVariables.includes(variable)) {
      return true;
    }

    // Check for nested properties (e.g., location.name)
    const parts = variable.split('.');
    if (parts.length > 1) {
      const baseVariable = parts[0];
      return availableVariables.includes(baseVariable);
    }

    // Check for helper functions
    if (variable.includes('(')) {
      const helperName = variable.split('(')[0];
      return this.isHelperAvailable(helperName);
    }

    return false;
  }

  // Check if a helper is available
  private isHelperAvailable(helperName: string): boolean {
    const availableHelpers = [
      'location', 'locationCity', 'locationState', 'locationZip', 'locationPhone',
      'locationAddress', 'locationUrl', 'campaign', 'campaignObjective', 'campaignBudget',
      'campaignPlatform', 'formatPhone', 'formatCurrency', 'formatDate', 'conditional',
      'ifEquals', 'ifNotEquals', 'uppercase', 'lowercase', 'capitalize', 'truncate',
      'add', 'subtract', 'multiply', 'divide', 'join', 'first', 'last', 'custom'
    ];
    return availableHelpers.includes(helperName);
  }

  // Extract all variables from a template
  extractVariables(template: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  // Get available variables for a context
  getAvailableVariables(context: VariableContext): string[] {
    const variables: string[] = [];

    // Location variables
    if (context.location) {
      variables.push(
        'location.name', 'location.city', 'location.state', 'location.zipCode',
        'location.phoneNumber', 'location.address', 'location.landingPageUrl'
      );
    }

    // Campaign variables
    if (context.campaign) {
      variables.push(
        'campaign.name', 'campaign.objective', 'campaign.platform',
        'campaign.budget', 'campaign.startDate', 'campaign.endDate'
      );
    }

    // Custom variables
    if (context.custom) {
      Object.keys(context.custom).forEach(key => {
        variables.push(`custom.${key}`);
      });
    }

    return variables;
  }

  // Process multiple templates
  processTemplates(templates: Record<string, string>, data: VariableContext): Record<string, string> {
    const results: Record<string, string> = {};

    for (const [key, template] of Object.entries(templates)) {
      try {
        results[key] = this.compileTemplate(template, data);
      } catch (error) {
        console.error(`Error processing template ${key}:`, error);
        results[key] = template; // Keep original if processing fails
      }
    }

    return results;
  }

  // Preview template with sample data
  previewTemplate(template: string, sampleData: VariableContext): {
    processed: string;
    variables: string[];
    validation: {
      isValid: boolean;
      missingVariables: string[];
      errors: string[];
      warnings: string[];
    };
  } {
    const variables = this.extractVariables(template);
    const availableVariables = this.getAvailableVariables(sampleData);
    const validation = this.validateTemplate(template, availableVariables);
    const processed = this.compileTemplate(template, sampleData);

    return {
      processed,
      variables,
      validation
    };
  }

  // Sanitize template to prevent XSS
  sanitizeTemplate(template: string): string {
    // Remove potentially dangerous content
    return template
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  // Create a safe template context
  createSafeContext(data: VariableContext): VariableContext {
    const safeData: VariableContext = {};

    // Safely copy location data
    if (data.location) {
      safeData.location = {
        name: this.sanitizeString(data.location.name),
        city: this.sanitizeString(data.location.city),
        state: this.sanitizeString(data.location.state),
        zipCode: this.sanitizeString(data.location.zipCode),
        phoneNumber: this.sanitizeString(data.location.phoneNumber),
        address: this.sanitizeString(data.location.address),
        landingPageUrl: this.sanitizeString(data.location.landingPageUrl),
        coordinates: data.location.coordinates
      };
    }

    // Safely copy campaign data
    if (data.campaign) {
      safeData.campaign = {
        name: this.sanitizeString(data.campaign.name),
        objective: this.sanitizeString(data.campaign.objective),
        platform: this.sanitizeString(data.campaign.platform),
        budget: data.campaign.budget,
        startDate: this.sanitizeString(data.campaign.startDate),
        endDate: this.sanitizeString(data.campaign.endDate)
      };
    }

    // Safely copy custom data
    if (data.custom) {
      safeData.custom = {};
      for (const [key, value] of Object.entries(data.custom)) {
        safeData.custom[key] = this.sanitizeString(value);
      }
    }

    return safeData;
  }

  // Sanitize string input
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Get template statistics
  getTemplateStats(template: string): {
    variableCount: number;
    characterCount: number;
    lineCount: number;
    complexity: 'low' | 'medium' | 'high';
  } {
    const variables = this.extractVariables(template);
    const characterCount = template.length;
    const lineCount = template.split('\n').length;
    
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (variables.length > 5 || characterCount > 500) {
      complexity = 'high';
    } else if (variables.length > 2 || characterCount > 200) {
      complexity = 'medium';
    }

    return {
      variableCount: variables.length,
      characterCount,
      lineCount,
      complexity
    };
  }
}

// Export singleton instance
export const templateEngine = TemplateEngine.getInstance();

// Export class for testing
export { TemplateEngine };