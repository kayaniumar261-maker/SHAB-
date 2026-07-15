/* ==========================================
   SHAB ERP Global Search Service
   Enterprise Version 2.0
========================================== */

import { Storage } from './storage';

export type SearchModule =
  | 'Client'
  | 'Case'
  | 'Document'
  | 'Payment'
  | 'Quotation'
  | 'Legal Notice'
  | 'Hearing'
  | 'Calendar'
  | 'Task'
  | 'Staff';

export interface SearchResult {
  id: number | string;

  reference?: string;

  title: string;

  subtitle?: string;

  module: SearchModule;

  route: string;

  icon?: string;
}

class SearchService {
  private searchCollection(
    collection: unknown[],
    module: SearchModule,
    route: string,
    query: string,
  ): SearchResult[] {
    const search = query.toLowerCase();

    return collection
      .filter((item: any) => {
        return Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .map((item: any) => ({
        id: item.id,

        reference: item.reference,

        title:
          item.name ||
          item.title ||
          item.reference ||
          'Untitled',

        subtitle:
          item.clientName ||
          item.description ||
          item.email ||
          item.phone ||
          '',

        module,

        route,

        icon: module,
      }));
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    let results: SearchResult[] = [];

    results.push(
      ...this.searchCollection(
        Storage.getClients(),
        'Client',
        '/clients',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getCases(),
        'Case',
        '/cases',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getDocuments(),
        'Document',
        '/documents',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getPayments(),
        'Payment',
        '/payments',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getHearings(),
        'Hearing',
        '/hearings',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getCalendarEvents(),
        'Calendar',
        '/calendar',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getStaff(),
        'Staff',
        '/staff',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getTasks(),
        'Task',
        '/tasks',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getQuotations(),
        'Quotation',
        '/quotations',
        query,
      ),
    );

    results.push(
      ...this.searchCollection(
        Storage.getLegalNotices(),
        'Legal Notice',
        '/legal-notices',
        query,
      ),
    );

    return results.sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }
}

export const GlobalSearch =
  new SearchService();
