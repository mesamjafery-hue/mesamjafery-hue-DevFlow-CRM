import { useCallback, useEffect, useState } from 'react';
import { clientApi, documentApi, invoiceApi, messageApi, paymentApi, quotationApi, requirementApi, ticketApi } from '../api';
import './Crud.css';
import './Vault.css';

const msg = (err, fallback) => err?.response?.data?.message || fallback;

function Heading({ kicker, title, blurb, children }) {
  return <div className="page-heading"><div><span className="page-kicker">{kicker}</span><h1>{title}</h1><p>{blurb}</p></div>{children}</div>;
}

/* Requirement Vault — versioned requirements, attachments, approvals, change history */
export function RequirementVaultPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [state, setState] = useState('');
  const [form, setForm] = useState({ title: '', body: '' });
  const [uploadFile, setUploadFile] = useState(null);

  const load = useCallback(async () => {
    try { const result = await requirementApi.getAll({ limit: 200 }); setRows(result.data || []); setError(''); } catch (err) { setError(msg(err, 'Could not load requirements.')); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const openDetail = useCallback(async (requirement) => {
    setSelected(requirement); setDetail(null); setVersions([]); setAttachments([]); setState('');
    try {
      const [detailResult, versionResult, documentResult] = await Promise.all([
        requirementApi.getById(requirement.id),
        requirementApi.getVersions(requirement.id),
        documentApi.getAll({ relatedType: 'requirement', relatedId: requirement.id }),
      ]);
      setDetail(detailResult.data || requirement); setVersions(versionResult.data || []); setAttachments(documentResult.data || []);
    } catch (err) { setDetail(requirement); setError(msg(err, 'Could not load the vault detail.')); }
  }, []);

  const addVersion = async (event) => {
    event.preventDefault();
    try { await requirementApi.createVersion(selected.id, form); setForm({ title: '', body: '' }); await openDetail(selected); setState('New version recorded.'); } catch (err) { setState(msg(err, 'Could not record the version.')); }
  };

  const approve = async () => {
    try { await requirementApi.approve(selected.id); await load(); await openDetail(selected); setState('Requirement approved.'); } catch (err) { setState(msg(err, 'You may not have permission to approve.')); }
  };

  const attach = async (event) => {
    event.preventDefault();
    if (!uploadFile) return;
    try { await documentApi.upload(uploadFile, 'requirement', selected.id); setUploadFile(null); await openDetail(selected); setState('Attachment uploaded.'); } catch (err) { setState(msg(err, 'Upload failed — check the file type and size.')); }
  };

  return <div className="records-page">
    {error && <div className="records-error">{error}</div>}
    {selected && detail && <div className="modal-backdrop"><div className="edit-modal vault-modal">
      <div className="modal-header"><div><span className="page-kicker">{detail.code || `Requirement #${detail.id}`}</span><h2>{detail.title}</h2></div><button className="modal-close" onClick={() => { setSelected(null); setState(''); }}>×</button></div>
      <div className="vault-badges"><span className={`vault-badge status-${detail.status}`}>{detail.status}</span><span className="vault-badge">v{detail.currentVersion}</span><span className="vault-badge">{detail.priority}</span></div>
      <p className="vault-blurb">{detail.description}</p>
      {state && <div className="records-state">{state}</div>}
      <div className="vault-columns">
        <section>
          <h3>Change history</h3>
          <ol className="vault-versions">{versions.length === 0 && <li className="records-state">No versions yet.</li>}{versions.map((version) => <li key={`${version.versionNumber}-${version.createdAt}`}><header><strong>v{version.versionNumber}</strong> {version.title}</header><p>{version.body}</p></li>)}</ol>
          <form className="form-grid" onSubmit={addVersion}>
            <label>Title<input required minLength={3} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Version title" /></label>
            <label>Body<textarea required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="What changed in this version?" /></label>
            <div className="modal-actions"><button type="submit" className="secondary-action">Record version</button></div>
          </form>
        </section>
        <section>
          <h3>Attachments</h3>
          <ul className="vault-attachments">{attachments.length === 0 && <li className="records-state">No attachments yet.</li>}{attachments.map((document) => <li key={document.id}><a href={documentApi.getDownloadUrl(document.id)} target="_blank" rel="noreferrer">{document.originalName}</a><small>{Number(document.size || 0).toLocaleString()} bytes</small></li>)}</ul>
          <form className="form-grid" onSubmit={attach}>
            <label>File<input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.docx" onChange={(event) => setUploadFile(event.target.files[0])} /></label>
            <div className="modal-actions"><button type="submit" className="secondary-action">Upload attachment</button></div>
          </form>
        </section>
      </div>
      <div className="modal-actions"><button className="secondary-action" onClick={approve} disabled={detail.status === 'approved'}>{detail.status === 'approved' ? 'Approved' : 'Approve requirement'}</button></div>
    </div></div>}
    <Heading kicker="Workspace / Requirement Vault" title="Requirement Vault" blurb="Versioned requirements with attachments, approvals, and a full change history."><button className="secondary-action" onClick={load}>Refresh</button></Heading>
    <div className="records-table"><table>
      <thead><tr><th>Code</th><th>Title</th><th>Project</th><th>Priority</th><th>Version</th><th>Status</th><th /></tr></thead>
      <tbody>{rows.map((requirement) => <tr key={requirement.id}><td>{requirement.code}</td><td>{requirement.title}</td><td>{requirement.Project?.name || requirement.projectId}</td><td>{requirement.priority}</td><td>v{requirement.currentVersion}</td><td><span className={`vault-badge status-${requirement.status}`}>{requirement.status}</span></td><td className="row-actions"><button onClick={() => openDetail(requirement)}>Open vault</button></td></tr>)}</tbody>
    </table></div>
  </div>;
}

/* Documents — upload, list, download */
export function DocumentsPage() {
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [state, setState] = useState('');

  const load = useCallback(async () => {
    try { const result = await documentApi.getAll(); setRows(result.data || []); setError(''); } catch (err) { setError(msg(err, 'Could not load documents.')); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return;
    try { await documentApi.upload(file); setFile(null); await load(); setState('Document uploaded.'); } catch (err) { setState(msg(err, 'Upload failed — supported files are pdf, png, jpg, txt, and docx up to 5 MB.')); }
  };

  return <div className="records-page">
    {error && <div className="records-error">{error}</div>}
    <Heading kicker="Workspace / Documents" title="Documents" blurb="Upload project files and download them any time."><button className="secondary-action" onClick={load}>Refresh</button></Heading>
    <form className="documents-upload" onSubmit={upload}>
      <label>File<input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.docx" onChange={(event) => setFile(event.target.files[0])} /></label>
      <button type="submit" className="secondary-action">Upload</button>
    </form>
    {state && <div className="records-state">{state}</div>}
    <div className="records-table"><table>
      <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Related</th><th>Uploaded</th><th /></tr></thead>
      <tbody>{rows.length === 0 && <tr><td colSpan={6} className="records-state">No documents uploaded yet.</td></tr>}{rows.map((document) => <tr key={document.id}><td>{document.originalName}</td><td>{document.mimeType}</td><td>{Number(document.size || 0).toLocaleString()} bytes</td><td>{document.relatedType ? `${document.relatedType} #${document.relatedId}` : '—'}</td><td>{new Date(document.createdAt).toLocaleString()}</td><td className="row-actions"><a className="vault-download" href={documentApi.getDownloadUrl(document.id)} target="_blank" rel="noreferrer">Download</a></td></tr>)}</tbody>
    </table></div>
  </div>;
}

/* Ticket conversations — thread per ticket */
export function TicketConversationPage() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState('');

  const loadTickets = useCallback(async () => {
    try { const result = await ticketApi.getAll({ limit: 100 }); setTickets(result.data || []); setError(''); } catch (err) { setError(msg(err, 'Could not load tickets.')); }
  }, []);
  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const openThread = useCallback(async (ticket) => {
    setActiveTicket(ticket); setMessages([]); setState('');
    try { const result = await messageApi.getAll(ticket.id); setMessages(result.data || []); } catch (err) { setState(msg(err, 'Could not load the conversation.')); }
  }, []);

  const send = async (event) => {
    event.preventDefault();
    try { await messageApi.create(activeTicket.id, { body, isInternal }); setBody(''); setIsInternal(false); await openThread(activeTicket); setState('Message sent.'); } catch (err) { setState(msg(err, 'Could not send the message.')); }
  };

  return <div className="records-page">
    {error && <div className="records-error">{error}</div>}
    <Heading kicker="Workspace / Support" title="Ticket Conversations" blurb="Discuss support tickets with clients and keep an internal note when needed."><button className="secondary-action" onClick={loadTickets}>Refresh</button></Heading>
    <div className="records-table"><table>
      <thead><tr><th>Number</th><th>Title</th><th>Priority</th><th>Status</th><th /></tr></thead>
      <tbody>{tickets.length === 0 && <tr><td colSpan={5} className="records-state">No tickets yet.</td></tr>}{tickets.map((ticket) => <tr key={ticket.id} className={activeTicket?.id === ticket.id ? 'vault-active-row' : ''}><td>{ticket.number}</td><td>{ticket.title}</td><td>{ticket.priority}</td><td>{ticket.status}</td><td className="row-actions"><button onClick={() => openThread(ticket)}>Open conversation</button></td></tr>)}</tbody>
    </table></div>
    {activeTicket && <div className="vault-thread">
      <header><strong>{activeTicket.title}</strong><span>{activeTicket.number}</span></header>
      {state && <div className="records-state">{state}</div>}
      <ul>{messages.length === 0 && <li className="records-state">No messages yet.</li>}{messages.map((message) => <li key={message.id} className={message.isInternal ? 'vault-internal' : ''}><p>{message.body}</p><small>{message.isInternal ? 'Internal note' : 'Reply'} · {new Date(message.createdAt).toLocaleString()}</small></li>)}</ul>
      <form className="form-grid" onSubmit={send}>
        <label>Message<textarea required value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a reply…" /></label>
        <label className="documents-inline">Internal note<input type="checkbox" checked={isInternal} onChange={(event) => setIsInternal(event.target.checked)} /></label>
        <div className="modal-actions"><button type="submit" className="secondary-action">Send message</button></div>
      </form>
    </div>}
  </div>;
}

/* Payments — record payments against invoices */
export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'bank_transfer', reference: '' });
  const [error, setError] = useState('');
  const [state, setState] = useState('');

  const load = useCallback(async () => {
    try {
      const [paymentResult, invoiceResult] = await Promise.all([paymentApi.getAll(), invoiceApi.getAll({ limit: 100 })]);
      setPayments(paymentResult.data || []); setInvoices(invoiceResult.data || []); setError('');
    } catch (err) { setError(msg(err, 'Could not load payments.')); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const record = async (event) => {
    event.preventDefault();
    try { await paymentApi.create({ ...form, invoiceId: Number(form.invoiceId), amount: Number(form.amount) }); setForm({ invoiceId: '', amount: '', method: 'bank_transfer', reference: '' }); await load(); setState('Payment recorded.'); } catch (err) { setState(msg(err, 'Could not record the payment.')); }
  };

  return <div className="records-page">
    {error && <div className="records-error">{error}</div>}
    <Heading kicker="Workspace / Finance" title="Payments" blurb="Record payments received against invoices and keep the ledger accurate."><button className="secondary-action" onClick={load}>Refresh</button></Heading>
    <form className="form-grid documents-form" onSubmit={record}>
      <label>Invoice<select required value={form.invoiceId} onChange={(event) => setForm({ ...form, invoiceId: event.target.value })}><option value="">Select invoice…</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number || `Invoice #${invoice.id}`}</option>)}</select></label>
      <label>Amount<input required type="number" min={0} step={0.01} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
      <label>Method<select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option></select></label>
      <label>Reference<input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Transaction reference" /></label>
      <div className="modal-actions"><button type="submit" className="secondary-action">Record payment</button></div>
    </form>
    {state && <div className="records-state">{state}</div>}
    <div className="records-table"><table>
      <thead><tr><th>Invoice</th><th>Amount</th><th>Method</th><th>Reference</th><th>Paid at</th></tr></thead>
      <tbody>{payments.length === 0 && <tr><td colSpan={5} className="records-state">No payments recorded yet.</td></tr>}{payments.map((payment) => <tr key={payment.id}><td>{payment.invoiceId}</td><td>${Number(payment.amount || 0).toLocaleString()}</td><td>{payment.method}</td><td>{payment.reference || '—'}</td><td>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : new Date(payment.createdAt).toLocaleString()}</td></tr>)}</tbody>
    </table></div>
  </div>;
}

/* Task workspace — subtasks and comments per task */
export function TaskWorkspacePage() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState('');

  const loadTasks = useCallback(async () => {
    try { const result = await taskApi.getAll({ limit: 100 }); setTasks(result.data || []); setError(''); } catch (err) { setError(msg(err, 'Could not load tasks.')); }
  }, []);
  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const openTask = useCallback(async (task) => {
    setActiveTask(task); setSubtasks([]); setComments([]); setState('');
    try {
      const [subtaskResult, commentResult] = await Promise.all([subtaskApi.getAll(task.id), taskCommentApi.getAll(task.id)]);
      setSubtasks(subtaskResult.data || []); setComments(commentResult.data || []);
    } catch (err) { setState(msg(err, 'Could not load the task detail.')); }
  }, []);

  const addSubtask = async (event) => {
    event.preventDefault();
    try { await subtaskApi.create(activeTask.id, { title: subtaskTitle }); setSubtaskTitle(''); const result = await subtaskApi.getAll(activeTask.id); setSubtasks(result.data || []); setState('Subtask added.'); } catch (err) { setState(msg(err, 'Could not add the subtask.')); }
  };

  const toggleSubtask = async (subtask) => {
    const next = subtask.status === 'done' ? 'todo' : 'done';
    try { await subtaskApi.update(subtask.id, { status: next }); const result = await subtaskApi.getAll(activeTask.id); setSubtasks(result.data || []); } catch (err) { setState(msg(err, 'Could not update the subtask.')); }
  };

  const addComment = async (event) => {
    event.preventDefault();
    try { await taskCommentApi.create(activeTask.id, { body: commentBody }); setCommentBody(''); const result = await taskCommentApi.getAll(activeTask.id); setComments(result.data || []); setState('Comment added.'); } catch (err) { setState(msg(err, 'Could not add the comment.')); }
  };

  return <div className="records-page">
    {error && <div className="records-error">{error}</div>}
    <Heading kicker="Workspace / Delivery" title="Task Workspace" blurb="Break tasks into subtasks and keep the discussion with each task."><button className="secondary-action" onClick={loadTasks}>Refresh</button></Heading>
    <div className="records-table"><table>
      <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Due date</th><th /></tr></thead>
      <tbody>{tasks.length === 0 && <tr><td colSpan={5} className="records-state">No tasks yet.</td></tr>}{tasks.map((task) => <tr key={task.id} className={activeTask?.id === task.id ? 'vault-active-row' : ''}><td>{task.title}</td><td>{task.status}</td><td>{task.priority}</td><td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td><td className="row-actions"><button onClick={() => openTask(task)}>Open workspace</button></td></tr>)}</tbody>
    </table></div>
    {activeTask && <div className="vault-columns vault-thread vault-workspace">
      <section>
        <h3>Subtasks</h3>
        {state && <div className="records-state">{state}</div>}
        <ul className="vault-attachments">{subtasks.length === 0 && <li className="records-state">No subtasks yet.</li>}{subtasks.map((subtask) => <li key={subtask.id}><label className="documents-inline"><input type="checkbox" checked={subtask.status === 'done'} onChange={() => toggleSubtask(subtask)} /><span style={{ textDecoration: subtask.status === 'done' ? 'line-through' : 'none' }}>{subtask.title}</span></label><small>{subtask.status}</small></li>)}</ul>
        <form className="form-grid" onSubmit={addSubtask}>
          <label>New subtask<input required minLength={2} value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="e.g. Write migration" /></label>
          <div className="modal-actions"><button type="submit" className="secondary-action">Add subtask</button></div>
        </form>
      </section>
      <section>
        <h3>Comments</h3>
        <ul className="vault-versions">{comments.length === 0 && <li className="records-state">No comments yet.</li>}{comments.map((comment) => <li key={comment.id}><p>{comment.body}</p><small>{new Date(comment.createdAt).toLocaleString()}</small></li>)}</ul>
        <form className="form-grid" onSubmit={addComment}>
          <label>Comment<textarea required value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Write a comment…" /></label>
          <div className="modal-actions"><button type="submit" className="secondary-action">Add comment</button></div>
        </form>
      </section>
    </div>}
  </div>;
}

/* Quotations — send quotations to clients */
export function QuotationsPage() {
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ clientId: '', title: '', amount: '' });
  const [error, setError] = useState('');
  const [state, setState] = useState('');

  const load = useCallback(async () => {
    try {
      const [quotationResult, clientResult] = await Promise.all([quotationApi.getAll(), clientApi.getAll({ limit: 100 })]);
      setRows(quotationResult.data || []); setClients(clientResult.data || []); setError('');
    } catch (err) { setError(msg(err, 'Could not load quotations.')); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const create = async (event) => {
    event.preventDefault();
    try { await quotationApi.create({ ...form, clientId: Number(form.clientId), amount: Number(form.amount) }); setForm({ clientId: '', title: '', amount: '' }); await load(); setState('Quotation created.'); } catch (err) { setState(msg(err, 'Could not create the quotation.')); }
  };

  return <div className="records-page">
    {error && <div className="records-error">{error}</div>}
    <Heading kicker="Workspace / Sales" title="Quotations" blurb="Create quotations for client deals and keep the commercial history."><button className="secondary-action" onClick={load}>Refresh</button></Heading>
    <form className="form-grid documents-form" onSubmit={create}>
      <label>Client<select required value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}><option value="">Select client…</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.Company?.name || `Client #${client.id}`}</option>)}</select></label>
      <label>Title<input required minLength={3} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Quotation title" /></label>
      <label>Amount<input required type="number" min={0} step={0.01} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
      <div className="modal-actions"><button type="submit" className="secondary-action">Create quotation</button></div>
    </form>
    {state && <div className="records-state">{state}</div>}
    <div className="records-table"><table>
      <thead><tr><th>Number</th><th>Title</th><th>Client</th><th>Amount</th><th>Created</th></tr></thead>
      <tbody>{rows.length === 0 && <tr><td colSpan={5} className="records-state">No quotations yet.</td></tr>}{rows.map((quotation) => <tr key={quotation.id}><td>{quotation.number}</td><td>{quotation.title}</td><td>{quotation.Client?.companyId || quotation.clientId}</td><td>${Number(quotation.amount || 0).toLocaleString()}</td><td>{new Date(quotation.createdAt).toLocaleString()}</td></tr>)}</tbody>
    </table></div>
  </div>;
}