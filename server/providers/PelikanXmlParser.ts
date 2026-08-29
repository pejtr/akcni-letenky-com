import { XMLParser, XMLValidator } from "fast-xml-parser";

export interface PelikanRawCalendar {
  CALENDAR_ID?: string;
  URL?: string;
  PRICE?: number;
  TO?: string;
  FROM?: string;
  RETURN_TO?: string;
  RETURN_FROM?: string;
  AIRLINE?: string;
  DEPARTURE_IATA?: string;
  DESTINATION_IATA?: string;
  CITYPAIR_IATA?: string;
  CREATED?: string | number;
  [key: string]: any; // other fields we might ignore
}

export class PelikanXmlParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: true, // We don't need attributes for this feed
      parseTagValue: true,
      trimValues: true,
    });
  }

  /**
   * Safely parses the XML, ensuring it's well-formed and doesn't contain
   * malicious DOCTYPEs or external entities (fast-xml-parser ignores these by default).
   */
  parse(xmlContent: string): PelikanRawCalendar[] {
    // 1. Explicitly reject DOCTYPE declarations to prevent XXE (just to be extra safe before parsing)
    if (/<!DOCTYPE/i.test(xmlContent)) {
      throw new Error("XML contains forbidden DOCTYPE declaration");
    }

    // 2. Validate XML structure
    const validationResult = XMLValidator.validate(xmlContent);
    if (validationResult !== true) {
      throw new Error(`Malformed XML: ${validationResult.err.msg}`);
    }

    // 3. Parse XML
    const parsed = this.parser.parse(xmlContent);

    // 4. Extract calendars
    // The structure is expected to be <SERVER><Calendar><Calendar>...</Calendar>...</Calendar></SERVER>
    // fast-xml-parser maps this to: parsed.SERVER.Calendar.Calendar (which can be an array if multiple)
    
    const root = parsed?.SERVER?.Calendar;
    if (!root) {
      return []; // Return empty if no data found, rather than throwing
    }

    // Sometimes the nested <Calendar> element is missing or just a single object
    let calendars = root.Calendar;
    if (!calendars) {
      return [];
    }

    // Ensure it's an array
    if (!Array.isArray(calendars)) {
      calendars = [calendars];
    }

    return calendars;
  }
}
