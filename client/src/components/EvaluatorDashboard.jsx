import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function EvaluatorDashboard() {
  const [assignedSubmissions, setAssignedSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    relevanceToLOs: 0,
    innovationCreativity: 0,
    clarityAccessibility: 0,
    depth: 0,
    interactivityEngagement: 0,
    useOfTechnology: 0,
    scalabilityAdaptability: 0,
    ethicalStandards: 0,
    practicalApplication: 0,
    videoQuality: 0,
    comments: ''
  });
  const [activeView, setActiveView] = useState('submissions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedSubmissions();
  }, []);

  const loadAssignedSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/submissions/my-assignments`);
      setAssignedSubmissions(response.data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (field, value) => {
    setEvaluationForm(prev => ({
      ...prev,
      [field]: field === 'comments' ? value : (parseFloat(value) || 0)
    }));
  };

  const calculateTotal = () => {
    return Object.keys(evaluationForm)
      .filter(key => key !== 'comments')
      .reduce((sum, key) => sum + evaluationForm[key], 0);
  };

  const submitEvaluation = async () => {
    try {
      await axios.post(`${API_URL}/evaluations`, {
        submissionId: selectedSubmission._id,
        criteria: {
          relevanceToLOs: evaluationForm.relevanceToLOs,
          innovationCreativity: evaluationForm.innovationCreativity,
          clarityAccessibility: evaluationForm.clarityAccessibility,
          depth: evaluationForm.depth,
          interactivityEngagement: evaluationForm.interactivityEngagement,
          useOfTechnology: evaluationForm.useOfTechnology,
          scalabilityAdaptability: evaluationForm.scalabilityAdaptability,
          ethicalStandards: evaluationForm.ethicalStandards,
          practicalApplication: evaluationForm.practicalApplication,
          videoQuality: evaluationForm.videoQuality
        },
        comments: evaluationForm.comments
      });

      alert('Evaluation submitted successfully!');
      
      // Reset form
      setEvaluationForm({
        relevanceToLOs: 0,
        innovationCreativity: 0,
        clarityAccessibility: 0,
        depth: 0,
        interactivityEngagement: 0,
        useOfTechnology: 0,
        scalabilityAdaptability: 0,
        ethicalStandards: 0,
        practicalApplication: 0,
        videoQuality: 0,
        comments: ''
      });
      
      setSelectedSubmission(null);
      setActiveView('submissions');
      loadAssignedSubmissions();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert(error.response?.data?.error || 'Failed to submit evaluation');
    }
  };

  const SubmissionsListView = () => (
    <div className="container py-4">
      <h2 className="mb-4">My Assigned Submissions</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {assignedSubmissions.length === 0 ? (
            <div className="alert alert-info">
              <h5 className="alert-heading">No Submissions Assigned</h5>
              <p className="mb-0">You don't have any submissions assigned yet. Please wait for the admin to assign submissions to you.</p>
            </div>
          ) : (
            <div className="row">
              {assignedSubmissions.map(submission => (
                <div key={submission._id} className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">{submission.topic}</h5>
                    </div>
                    <div className="card-body">
                      <p><strong>Team:</strong> {submission.team?.teamName || 'N/A'}</p>
                      <p><strong>Team Lead:</strong> {submission.team?.teamLead?.name || 'N/A'}</p>
                      <p><strong>Status:</strong> 
                        <span className={`badge ms-2 ${
                          submission.status === 'evaluated' ? 'bg-success' : 
                          submission.status === 'under_review' ? 'bg-warning' :
                          'bg-secondary'
                        }`}>
                          {submission.status}
                        </span>
                      </p>
                      <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      
                      <div className="mt-3 border-top pt-3">
                        <p className="mb-1"><strong>Learning Outcomes:</strong></p>
                        <p className="small text-muted">{submission.learningOutcomes}</p>
                      </div>

                      {submission.description && (
                        <div className="mt-2">
                          <p className="mb-1"><strong>Description:</strong></p>
                          <p className="small text-muted">{submission.description}</p>
                        </div>
                      )}

                      <div className="mt-3 d-flex gap-2">
                        <a 
                          href={submission.videoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm flex-grow-1"
                        >
                           Watch Video
                        </a>
                        <button 
                          className="btn btn-primary btn-sm flex-grow-1"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setActiveView('evaluate');
                          }}
                        >
                           Evaluate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const EvaluationFormView = () => {
    const criteriaList = [
      { key: 'relevanceToLOs', label: 'Relevance to Learning Objectives/Outcomes', max: 5 },
      { key: 'innovationCreativity', label: 'Innovation & Creativity', max: 15 },
      { key: 'clarityAccessibility', label: 'Clarity and Accessibility', max: 10 },
      { key: 'depth', label: 'Depth', max: 5 },
      { key: 'interactivityEngagement', label: 'Interactivity and Engagement', max: 25 },
      { key: 'useOfTechnology', label: 'Use of Technology', max: 5 },
      { key: 'scalabilityAdaptability', label: 'Scalability and Adaptability', max: 10 },
      { key: 'ethicalStandards', label: 'Alignment with Ethical Standards', max: 5 },
      { key: 'practicalApplication', label: 'Practical Application', max: 10 },
      { key: 'videoQuality', label: 'Video Quality', max: 10 }
    ];

    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Evaluate: {selectedSubmission?.topic}</h4>
              </div>
              <div className="card-body">
                <div className="mb-4 p-3 bg-light rounded">
                  <h6>Submission Details</h6>
                  <p className="mb-1"><strong>Team:</strong> {selectedSubmission?.team?.teamName}</p>
                  <p className="mb-1"><strong>Team Lead:</strong> {selectedSubmission?.team?.teamLead?.name}</p>
                  <p className="mb-2">
                    <strong>Video Link:</strong> 
                    <a 
                      href={selectedSubmission?.videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ms-2 btn btn-sm btn-outline-primary"
                    >
                      Watch Video
                    </a>
                  </p>
                  <p className="mb-0"><strong>Learning Outcomes:</strong> {selectedSubmission?.learningOutcomes}</p>
                </div>

                <h5 className="mb-3">Evaluation Criteria</h5>

                {criteriaList.map(criteria => (
                  <div key={criteria.key} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">
                        <strong>{criteria.label}</strong>
                      </label>
                      <span className="badge bg-secondary">
                        {evaluationForm[criteria.key].toFixed(1)} / {criteria.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max={criteria.max}
                      step="0.5"
                      value={evaluationForm[criteria.key]}
                      onChange={(e) => handleEvaluationChange(criteria.key, e.target.value)}
                    />
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">0</small>
                      <small className="text-muted">{criteria.max}</small>
                    </div>
                  </div>
                ))}

                <div className="mb-4">
                  <label className="form-label"><strong>Comments & Feedback</strong></label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide detailed feedback for the team..."
                    value={evaluationForm.comments}
                    onChange={(e) => handleEvaluationChange('comments', e.target.value)}
                  />
                </div>

                <div className="alert alert-success">
                  <h5 className="mb-0">Total Score: {calculateTotal().toFixed(1)}/100</h5>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={submitEvaluation}
                    disabled={calculateTotal() === 0}
                  >
                    ✅ Submit Evaluation
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setActiveView('submissions');
                      setSelectedSubmission(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">📋 Evaluation Guidelines</h6>
              </div>
              <div className="card-body">
                <ul className="small mb-0">
                  <li className="mb-2">Watch the entire video before evaluating</li>
                  <li className="mb-2">Be objective and fair in your assessment</li>
                  <li className="mb-2">Provide constructive feedback</li>
                  <li className="mb-2">Consider the learning objectives</li>
                  <li className="mb-2">Evaluate based on criteria weightage</li>
                  <li className="mb-0">Your evaluation is anonymous to participants</li>
                </ul>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-warning">
                <h6 className="mb-0">⭐ Scoring Reference</h6>
              </div>
              <div className="card-body small">
                <p className="mb-2"><strong>Excellent (90-100%):</strong> Exceeds all expectations</p>
                <p className="mb-2"><strong>Good (70-89%):</strong> Meets expectations well</p>
                <p className="mb-2"><strong>Average (50-69%):</strong> Meets basic requirements</p>
                <p className="mb-0"><strong>Poor (Below 50%):</strong> Needs improvement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {activeView === 'submissions' && <SubmissionsListView />}
      {activeView === 'evaluate' && <EvaluationFormView />}
    </div>
  );
}