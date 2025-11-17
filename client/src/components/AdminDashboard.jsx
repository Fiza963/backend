import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminChat from './AdminChat';

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingEvaluators, setPendingEvaluators] = useState([]);
  const [approvedEvaluators, setApprovedEvaluators] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalSubmissions: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    pendingEvaluators: 0
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadPendingEvaluators(),
        loadApprovedEvaluators(),
        loadSubmissions(),
        loadStatistics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPendingEvaluators = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/pending-evaluators`);
      setPendingEvaluators(response.data);
    } catch (error) {
      console.error('Error loading pending evaluators:', error);
    }
  };

  const loadApprovedEvaluators = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/approved-evaluators`);
      setApprovedEvaluators(response.data);
    } catch (error) {
      console.error('Error loading approved evaluators:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/submissions`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const [submissionsRes, evaluatorsRes] = await Promise.all([
        axios.get(`${API_URL}/submissions`),
        axios.get(`${API_URL}/admin/pending-evaluators`)
      ]);

      const subs = submissionsRes.data;
      setStats({
        totalTeams: new Set(subs.map(s => s.team._id)).size,
        totalSubmissions: subs.length,
        pendingEvaluations: subs.filter(s => s.status === 'pending' || s.status === 'under_review').length,
        completedEvaluations: subs.filter(s => s.status === 'evaluated').length,
        pendingEvaluators: evaluatorsRes.data.length
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const approveEvaluator = async (evaluatorId) => {
    try {
      await axios.post(`${API_URL}/admin/approve-evaluator/${evaluatorId}`);
      alert('Evaluator approved successfully!');
      loadData();
    } catch (error) {
      console.error('Error approving evaluator:', error);
      alert('Failed to approve evaluator');
    }
  };


  // ====== UI COMPONENTS ======
  const StatCard = ({ label, value, color }) => (
    <div className="col-md-3">
      <div className={`card border-0 shadow-sm h-100 bg-light`}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <p className="text-muted mb-1 small">{label}</p>
            <h3 className="fw-bold mb-0">{value}</h3>
          </div>
          <div className={`p-3 rounded-circle bg-${color} bg-opacity-10`} />
        </div>
      </div>
    </div>
  );

  // ====== TABS ======
  const OverviewTab = () => (
    <div className="container-fluid py-4">
      <h2 className="mb-4 fw-bold">Dashboard Overview</h2>

      <div className="row g-4 mb-4">
        <StatCard label="Total Teams" value={stats.totalTeams} color="primary" />
        <StatCard label="Total Submissions" value={stats.totalSubmissions} color="success" />
        <StatCard label="Pending Evaluations" value={stats.pendingEvaluations} color="warning" />
        <StatCard label="Completed" value={stats.completedEvaluations} color="info" />
      </div>

      {stats.pendingEvaluators > 0 && (
        <div className="alert alert-warning shadow-sm d-flex align-items-center" role="alert">
          ⚠️ You have <strong className="mx-1">{stats.pendingEvaluators}</strong> evaluator(s) pending approval.
          <button
            className="btn btn-link ms-2 p-0 fw-bold"
            onClick={() => setActiveTab('evaluators')}
          >
            Review Now
          </button>
        </div>
      )}

      <div className="alert alert-success shadow-sm mb-4">
        <h5 className="alert-heading fw-bold">Automated Evaluation System Active</h5>
        <p className="mb-0">Each new submission is automatically assigned to 3 random approved evaluators.</p>
        <hr />
        <small>
          <strong>Available Evaluators:</strong> {approvedEvaluators.length}
          {approvedEvaluators.length < 3 && (
            <span className="text-danger ms-2">⚠️ Minimum 3 required for automation</span>
          )}
        </small>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-bold">Recent Submissions</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="bg-light text-secondary">
                <tr>
                  <th>Team</th>
                  <th>Topic</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Evaluators</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 5).map(sub => (
                  <tr key={sub._id}>
                    <td><strong>{sub.team?.teamName || 'N/A'}</strong></td>
                    <td>{sub.topic}</td>
                    <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${
                        sub.status === 'evaluated' ? 'success' :
                        sub.status === 'under_review' ? 'info' : 'warning'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{sub.assignedEvaluators?.length || 0}/3</td>
                    <td>
                      <a
                        href={sub.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      >
                        Watch
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const EvaluatorsTab = () => (
    <div className="container-fluid py-4">
      <h2 className="mb-4 fw-bold">Evaluator Management</h2>

      {pendingEvaluators.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-warning bg-opacity-10 border-0 py-3">
            <h5 className="mb-0 fw-bold">Pending Approvals ({pendingEvaluators.length})</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {pendingEvaluators.map(ev => (
                <div key={ev._id} className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h6 className="fw-bold">{ev.name}</h6>
                      <p className="mb-1"><strong>Email:</strong> {ev.email}</p>
                      <p className="mb-1"><strong>Phone:</strong> {ev.phone}</p>
                      <p className="mb-1"><strong>Qualification:</strong> {ev.qualification}</p>
                      <p className="mb-3"><strong>Experience:</strong> {ev.experience}</p>
                      <button
                        className="btn btn-success btn-sm rounded-pill px-3"
                        onClick={() => approveEvaluator(ev._id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pendingEvaluators.length === 0 && (
        <div className="alert alert-info shadow-sm">No pending evaluator approvals.</div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-success bg-opacity-10 border-0 py-3">
          <h5 className="mb-0 fw-bold">Approved Evaluators ({approvedEvaluators.length})</h5>
        </div>
        <div className="card-body">
          {approvedEvaluators.length === 0 ? (
            <p className="text-muted mb-0">No approved evaluators yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="bg-light text-secondary">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Qualification</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEvaluators.map(ev => (
                    <tr key={ev._id}>
                      <td>{ev.name}</td>
                      <td>{ev.email}</td>
                      <td>{ev.qualification}</td>
                      <td><span className="badge bg-success">Approved</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SubmissionsTab = () => (
    <div className="container-fluid py-4">
      <h2 className="mb-4 fw-bold">Submission Management</h2>

      <div className="alert alert-info shadow-sm">
        <strong>Automatic Assignment:</strong> New submissions are assigned to 3 random approved evaluators.
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="bg-light text-secondary">
                <tr>
                  <th>Team</th>
                  <th>Topic</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Assigned Evaluators</th>
                  <th>Video</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td>
                      <strong>{sub.team?.teamName}</strong><br />
                      <small className="text-muted">Lead: {sub.team?.teamLead?.name}</small>
                    </td>
                    <td>{sub.topic}</td>
                    <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${
                        sub.status === 'evaluated' ? 'success' :
                        sub.status === 'under_review' ? 'info' : 'warning'
                      }`}>{sub.status}</span>
                    </td>
                    <td>
                      {sub.assignedEvaluators?.length ? (
                        <div>
                          <small className="text-success fw-bold">
                            {sub.assignedEvaluators.length}/3 Assigned
                          </small>
                          <br />
                          {sub.assignedEvaluators.map((ev, i) => (
                            <small key={i} className="badge bg-primary me-1">{ev.name}</small>
                          ))}
                        </div>
                      ) : (
                        <small className="text-danger">No evaluators assigned</small>
                      )}
                    </td>
                    <td>
                      <a
                        href={sub.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      >
                        Watch
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultsTab = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
      const loadLeaderboard = async () => {
        try {
          const response = await axios.get(`${API_URL}/leaderboard`);
          setLeaderboard(response.data);
        } catch (error) {
          console.error('Error loading leaderboard:', error);
        }
      };
      loadLeaderboard();
    }, []);

    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Competition Results</h2>
          <button className="btn btn-success rounded-pill px-3">Export to Excel</button>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="bg-dark text-white">
                <tr>
                  <th>Rank</th>
                  <th>Team Lead</th>
                  <th>Topic</th>
                  <th>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={idx} className={idx < 3 ? 'table-warning' : ''}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td>{entry.team?.teamLead?.name || 'N/A'}</td>
                    <td>{entry.topic}</td>
                    <td><strong className="text-success">{entry.avgScore}/100</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="bg-white border-bottom shadow-sm sticky-top">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0 fw-bold">
            {['overview', 'evaluators', 'submissions', 'results', 'chat'].map(tab => (
              <li key={tab} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab ? 'active text-primary' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'evaluators' && stats.pendingEvaluators > 0 && (
                    <span className="badge bg-warning ms-2">{stats.pendingEvaluators}</span>
                  )}
                  {tab === ' Chat'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'evaluators' && <EvaluatorsTab />}
      {activeTab === 'submissions' && <SubmissionsTab />}
      {activeTab === 'results' && <ResultsTab />}
      {activeTab === 'chat' && <AdminChat currentUser={user} />}
    </div>
  );
}
