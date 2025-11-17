import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

/**
 * This file exposes the default ParticipantDashboard component
 * and attaches subcomponents as static properties so App can render:
 * ParticipantDashboard (default)
 * ParticipantDashboard.SubmissionFormView
 * ParticipantDashboard.EvaluationResults
 * ParticipantDashboard.LeaderboardView
 */

const ParticipantDashboard = ({ user, mySubmission, setActiveView, loadMySubmission }) => {
  useEffect(() => {
    if (!mySubmission) loadMySubmission();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Participant Dashboard</h2>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Team Information</h5>
              {user.teamId ? (
                <>
                  <p><strong>Team:</strong> {user.teamId.teamName}</p>
                  <p><strong>Members:</strong> {user.teamId.members.length}/5</p>
                </>
              ) : (
                <p className="text-danger">No team assigned</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Submission Status</h5>
              {mySubmission ? (
                <>
                  <p><strong>Status:</strong> <span className="badge bg-info">{mySubmission.status}</span></p>
                  <p><strong>Topic:</strong> {mySubmission.topic}</p>
                </>
              ) : (
                <p className="text-warning">No submission yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Quick Actions</h5>
              <button className="btn btn-primary btn-sm w-100 mb-2" onClick={() => setActiveView('submit')}>
                {mySubmission ? 'Update Submission' : 'Submit Video'}
              </button>
              <button className="btn btn-outline-primary btn-sm w-100" onClick={() => setActiveView('leaderboard')}>
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {mySubmission && mySubmission.status === 'evaluated' && (
        <div className="card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">Your Submission was evaluated</h5>
              <p className="mb-0">Click to view full evaluation results</p>
            </div>
            <div>
              <button className="btn btn-outline-primary" onClick={() => setActiveView('evaluations')}>
                View Full Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------- SubmissionFormView (internal) ---------------------- */
const SubmissionFormView = ({ mySubmission, onSubmitted }) => {
  const [formData, setFormData] = useState({
    videoLink: mySubmission?.videoLink || '',
    topic: mySubmission?.topic || '',
    learningOutcomes: mySubmission?.learningOutcomes || '',
    description: mySubmission?.description || '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/submissions`, formData);
      if (response.data.assignedEvaluators) {
        setSuccess(`✅ Submission successful! Automatically assigned to evaluators: ${response.data.assignedEvaluators.join(', ')}`);
      } else {
        setSuccess('Submission successful!');
      }
      setTimeout(() => {
        onSubmitted();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{mySubmission ? 'Update' : 'Submit'} Video Content</h4>
            </div>
            <div className="card-body">
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label fw-bold">Video Link *</label>
                <input type="url" className="form-control" placeholder="https://drive.google.com/..."
                       value={formData.videoLink}
                       onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Topic *</label>
                <input type="text" className="form-control" value={formData.topic}
                       onChange={(e) => setFormData({ ...formData, topic: e.target.value })} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Learning Outcomes *</label>
                <textarea className="form-control" rows="3" value={formData.learningOutcomes}
                          onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Description</label>
                <textarea className="form-control" rows="4" value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={handleSubmit}>{mySubmission ? 'Update' : 'Submit'}</button>
                <button className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------- EvaluationResults (internal) ---------------------- */
const EvaluationResults = ({ submissionId }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loadedId, setLoadedId] = useState(null);

  useEffect(() => {
    if (submissionId && submissionId !== loadedId) {
      loadEvaluations();
      setLoadedId(submissionId);
    }
    // eslint-disable-next-line
  }, [submissionId]);

  const loadEvaluations = async () => {
    try {
      const response = await axios.get(`${API_URL}/evaluations/submission/${submissionId}`);
      setEvaluations(response.data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    }
  };

  const avgScore = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length).toFixed(2)
    : 0;

  return (
    <div className="container py-4">
      <h4 className="mb-3">Average Score: {avgScore}/100</h4>
      <div className="row">
        {evaluations.map((evaluation, idx) => (
          <div key={idx} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-header">
                <strong>Evaluator {idx + 1}</strong>
              </div>
              <div className="card-body">
                <p><strong>Score:</strong> {evaluation.totalScore}/100</p>
                {evaluation.comments && (
                  <p className="small"><strong>Comments:</strong> {evaluation.comments}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------- LeaderboardView (internal) ---------------------- */
const LeaderboardView = ({ leaderboard, loadLeaderboard }) => {
  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Leaderboard</h2>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Lead</th>
                  <th>Topic</th>
                  <th>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={idx}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td>{entry.team?.teamLead?.name || 'N/A'}</td>
                    <td>{entry.topic}</td>
                    <td><strong className="text-primary">{entry.avgScore}/100</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Attach internals to default export so App can reference them */
ParticipantDashboard.SubmissionFormView = SubmissionFormView;
ParticipantDashboard.EvaluationResults = EvaluationResults;
ParticipantDashboard.LeaderboardView = LeaderboardView;

export default ParticipantDashboard;