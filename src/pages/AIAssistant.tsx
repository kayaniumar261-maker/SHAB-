import {
  Bot,
  Briefcase,
  Clipboard,
  FileText,
  Mail,
  MessageSquare,
  Scale,
  Send,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AssistantMode =
  | 'General'
  | 'Legal Notice'
  | 'Client Email'
  | 'Case Summary'
  | 'Task List'
  | 'Quotation Scope';

type StoredClient = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
};

type StoredCase = {
  id: number;
  title: string;
  reference: string;
  client?: string;
  caseType?: string;
  court?: string;
  opponent?: string;
  assignedTo?: string;
  nextHearing?: string;
  status?: string;
  notes?: string;
};

type AssistantMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

const ASSISTANT_STORAGE_KEY =
  'shab-ai-assistant-history';

const CLIENTS_STORAGE_KEY = 'shab-clients';
const CASES_STORAGE_KEY = 'shab-cases';

function loadArray<T>(key: string): T[] {
  try {
    const savedValue =
      window.localStorage.getItem(key);

    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
}

function loadMessages(): AssistantMessage[] {
  return loadArray<AssistantMessage>(
    ASSISTANT_STORAGE_KEY,
  );
}

function loadClients(): StoredClient[] {
  return loadArray<StoredClient>(
    CLIENTS_STORAGE_KEY,
  );
}

function loadCases(): StoredCase[] {
  return loadArray<StoredCase>(
    CASES_STORAGE_KEY,
  );
}

function createGeneralResponse(
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  return `SHAB EXECUTIVE ASSISTANT

Instruction:
${instruction}

Client:
${client?.name || 'Not selected'}

Case:
${
  caseItem
    ? `${caseItem.reference} — ${caseItem.title}`
    : 'Not selected'
}

Suggested approach:

1. Review all relevant agreements, correspondence, payment records and identification documents.

2. Confirm the complete chronology and identify any missing evidence.

3. Determine the appropriate legal or administrative procedure.

4. Prepare the required correspondence, notice, filing or internal task list.

5. Record the next deadline, responsible staff member and follow-up date.

Internal note:

This is a structured working draft. Review the facts and applicable UAE law before sending or filing anything.`;
}

function createLegalNotice(
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  const recipient =
    caseItem?.opponent || '[RECIPIENT NAME]';

  return `WITHOUT PREJUDICE

LEGAL NOTICE

From:
${client?.name || '[CLIENT NAME]'}

To:
${recipient}

Reference:
${caseItem?.reference || '[CASE REFERENCE]'}

Subject:
Formal Legal Notice

Dear Sir/Madam,

We act for ${
    client?.name || '[CLIENT NAME]'
  }.

Our client’s position is summarised as follows:

${instruction}

Despite previous requests and opportunities to resolve the matter amicably, the outstanding obligations remain unfulfilled.

You are hereby formally called upon to remedy the matter and fully comply with our client’s demands within fifteen (15) days from receipt of this notice.

Failing full compliance within the stated period, our client reserves the right to commence all appropriate legal proceedings and seek all available remedies, compensation, interest, expenses and legal costs, without further notice.

This notice is issued without prejudice to all rights and remedies available to our client.

Yours faithfully,

SHAB Legal Consultants FZC`;
}

function createClientEmail(
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  return `Subject: Update Regarding ${
    caseItem?.reference ||
    caseItem?.title ||
    'Your Matter'
  }

Dear ${client?.name || 'Client'},

Greetings from SHAB Legal Consultants FZC.

We write regarding ${
    caseItem
      ? `${caseItem.reference} — ${caseItem.title}`
      : 'your matter'
  }.

${instruction}

We kindly request you to review the above and provide any outstanding information or documents at your earliest convenience.

Please contact us should you require any clarification.

Kind regards,

SHAB Legal Consultants FZC`;
}

function createCaseSummary(
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  return `CASE SUMMARY

Case Reference:
${caseItem?.reference || 'Not recorded'}

Case Title:
${caseItem?.title || 'Not recorded'}

Client:
${
  client?.name ||
  caseItem?.client ||
  'Not recorded'
}

Opponent:
${caseItem?.opponent || 'Not recorded'}

Case Type:
${caseItem?.caseType || 'Not recorded'}

Court / Authority:
${caseItem?.court || 'Not recorded'}

Status:
${caseItem?.status || 'Not recorded'}

Assigned To:
${caseItem?.assignedTo || 'Not recorded'}

Next Hearing:
${caseItem?.nextHearing || 'Not scheduled'}

Existing Notes:
${caseItem?.notes || 'No existing notes'}

Additional Instructions:
${instruction}

RECOMMENDED NEXT STEPS

1. Verify the chronology and supporting documents.
2. Confirm the next procedural deadline.
3. Identify evidence still required from the client.
4. Prepare the next filing, notice or correspondence.
5. Update the client and assign internal follow-up tasks.`;
}

function createTaskList(
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  return `SHAB INTERNAL TASK LIST

Client:
${
  client?.name ||
  caseItem?.client ||
  'Not selected'
}

Case:
${
  caseItem
    ? `${caseItem.reference} — ${caseItem.title}`
    : 'Not selected'
}

Objective:
${instruction}

TASKS

☐ Review the complete case file.

☐ Confirm the factual chronology with the client.

☐ Check whether all identification and authority documents are available.

☐ Review agreements, invoices, receipts, messages and notices.

☐ Identify the correct court, authority or dispute-resolution forum.

☐ Prepare the required legal document or correspondence.

☐ Arrange internal review and approval.

☐ Send the client an update.

☐ Add the next deadline or hearing to the calendar.

☐ Record completion notes in the case file.`;
}

function createQuotationScope(
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  return `PROPOSED LEGAL SERVICES SCOPE

Client:
${
  client?.name ||
  caseItem?.client ||
  '[CLIENT NAME]'
}

Matter:
${
  caseItem
    ? `${caseItem.reference} — ${caseItem.title}`
    : '[MATTER DESCRIPTION]'
}

Client Instructions:
${instruction}

PROPOSED SCOPE OF SERVICES

1. Initial legal consultation and review of available documents.

2. Assessment of the factual and legal position.

3. Preparation of the required legal notice, correspondence or filing.

4. Communication and follow-up with the relevant parties or authority.

5. Periodic client updates regarding material developments.

EXCLUSIONS

Court fees, government charges, expert fees, translation fees, notarisation, courier charges and third-party expenses are excluded unless expressly stated.

PAYMENT TERMS

The professional fee, VAT and payment schedule shall be stated in the final quotation issued by SHAB Legal Consultants FZC.`;
}

function generateResponse(
  mode: AssistantMode,
  instruction: string,
  client?: StoredClient,
  caseItem?: StoredCase,
): string {
  if (mode === 'Legal Notice') {
    return createLegalNotice(
      instruction,
      client,
      caseItem,
    );
  }

  if (mode === 'Client Email') {
    return createClientEmail(
      instruction,
      client,
      caseItem,
    );
  }

  if (mode === 'Case Summary') {
    return createCaseSummary(
      instruction,
      client,
      caseItem,
    );
  }

  if (mode === 'Task List') {
    return createTaskList(
      instruction,
      client,
      caseItem,
    );
  }

  if (mode === 'Quotation Scope') {
    return createQuotationScope(
      instruction,
      client,
      caseItem,
    );
  }

  return createGeneralResponse(
    instruction,
    client,
    caseItem,
  );
}

export function AIAssistant() {
  const [messages, setMessages] =
    useState<AssistantMessage[]>(
      loadMessages,
    );

  const [clients, setClients] =
    useState<StoredClient[]>(loadClients);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [mode, setMode] =
    useState<AssistantMode>('General');

  const [selectedClientName, setSelectedClientName] =
    useState('');

  const [selectedCaseReference, setSelectedCaseReference] =
    useState('');

  const [instruction, setInstruction] =
    useState('');

  useEffect(() => {
    window.localStorage.setItem(
      ASSISTANT_STORAGE_KEY,
      JSON.stringify(messages),
    );
  }, [messages]);

  useEffect(() => {
    const refreshData = () => {
      setClients(loadClients());
      setCases(loadCases());
    };

    refreshData();

    window.addEventListener('focus', refreshData);
    window.addEventListener('storage', refreshData);

    return () => {
      window.removeEventListener(
        'focus',
        refreshData,
      );

      window.removeEventListener(
        'storage',
        refreshData,
      );
    };
  }, []);

  const selectedClient = useMemo(
    () =>
      clients.find(
        (client) =>
          client.name === selectedClientName,
      ),
    [clients, selectedClientName],
  );

  const selectedCase = useMemo(
    () =>
      cases.find(
        (caseItem) =>
          caseItem.reference ===
          selectedCaseReference,
      ),
    [cases, selectedCaseReference],
  );

  const availableCases = useMemo(() => {
    if (!selectedClientName) {
      return cases;
    }

    return cases.filter(
      (caseItem) =>
        !caseItem.client ||
        caseItem.client === selectedClientName,
    );
  }, [cases, selectedClientName]);

  const submitInstruction = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!instruction.trim()) {
      window.alert(
        'Please enter your instruction.',
      );

      return;
    }

    const now = new Date().toISOString();

    const userMessage: AssistantMessage = {
      id: Date.now(),
      role: 'user',
      content: instruction.trim(),
      createdAt: now,
    };

    const response = generateResponse(
      mode,
      instruction.trim(),
      selectedClient,
      selectedCase,
    );

    const assistantMessage: AssistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: response,
      createdAt: now,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);

    setInstruction('');
  };

  const copyMessage = async (
    content: string,
  ) => {
    try {
      await navigator.clipboard.writeText(
        content,
      );

      window.alert(
        'Draft copied to clipboard.',
      );
    } catch {
      const textArea =
        window.document.createElement(
          'textarea',
        );

      textArea.value = content;

      window.document.body.appendChild(
        textArea,
      );

      textArea.select();
      window.document.execCommand('copy');

      window.document.body.removeChild(
        textArea,
      );

      window.alert(
        'Draft copied to clipboard.',
      );
    }
  };

  const deleteMessage = (id: number) => {
    setMessages((currentMessages) =>
      currentMessages.filter(
        (message) => message.id !== id,
      ),
    );
  };

  const clearHistory = () => {
    const confirmed = window.confirm(
      'Delete the complete assistant history?',
    );

    if (!confirmed) {
      return;
    }

    setMessages([]);
  };

  const modes: {
    label: AssistantMode;
    icon: typeof Sparkles;
  }[] = [
    {
      label: 'General',
      icon: Sparkles,
    },
    {
      label: 'Legal Notice',
      icon: Scale,
    },
    {
      label: 'Client Email',
      icon: Mail,
    },
    {
      label: 'Case Summary',
      icon: Briefcase,
    },
    {
      label: 'Task List',
      icon: MessageSquare,
    },
    {
      label: 'Quotation Scope',
      icon: FileText,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <Bot className="h-8 w-8 text-violet-600" />
            AI Assistant
          </h1>

          <p className="mt-1 text-gray-500">
            Generate structured SHAB working drafts.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-800">
        This version creates structured templates using
        information saved in this app. It is not yet
        connected to an external AI model. Review every
        draft before sending, serving or filing it.
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-gray-900">
          Choose an assistant action
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {modes.map((assistantMode) => {
            const Icon = assistantMode.icon;

            return (
              <button
                key={assistantMode.label}
                type="button"
                onClick={() =>
                  setMode(assistantMode.label)
                }
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center ${
                  mode === assistantMode.label
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />

                <span className="text-xs font-semibold">
                  {assistantMode.label}
                </span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={submitInstruction}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Client
              </label>

              <select
                value={selectedClientName}
                onChange={(event) => {
                  setSelectedClientName(
                    event.target.value,
                  );

                  setSelectedCaseReference('');
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-violet-500"
              >
                <option value="">
                  No client selected
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.name}
                  >
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Related case
              </label>

              <select
                value={selectedCaseReference}
                onChange={(event) =>
                  setSelectedCaseReference(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-violet-500"
              >
                <option value="">
                  No case selected
                </option>

                {availableCases.map(
                  (caseItem) => (
                    <option
                      key={caseItem.id}
                      value={caseItem.reference}
                    >
                      {caseItem.reference} —{' '}
                      {caseItem.title}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Instruction
            </label>

            <textarea
              rows={5}
              value={instruction}
              onChange={(event) =>
                setInstruction(
                  event.target.value,
                )
              }
              placeholder="Example: Draft a final demand for AED 25,000 arising from unpaid professional services, with a 15-day deadline."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700"
          >
            <Send className="h-5 w-5" />
            Generate {mode}
          </button>
        </form>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Assistant History
          </h2>

          <span className="text-sm text-gray-500">
            {messages.length} messages
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                message.role === 'assistant'
                  ? 'border-violet-200 bg-white'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 rounded-xl p-3 ${
                    message.role === 'assistant'
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {message.role === 'assistant'
                      ? 'SHAB Assistant'
                      : 'Your Instruction'}
                  </p>

                  <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-gray-700">
                    {message.content}
                  </pre>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyMessage(
                          message.content,
                        )
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50"
                    >
                      <Clipboard className="h-4 w-4" />
                      Copy
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteMessage(message.id)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <Bot className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-gray-500">
                No assistant drafts have been generated.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
