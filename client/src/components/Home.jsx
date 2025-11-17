import React from 'react';
import { LogIn, UserPlus, Send, CheckCircle, Trophy } from 'lucide-react';

const valueProps = [
  {
    title: "Submit Content",
    description: "Securely upload your video link, topic, and learning outcomes for assessment.",
    icon: Send
  },
  {
    title: "Evaluate & Score",
    description: "Receive objective, data-driven feedback from qualified evaluators on defined criteria.",
    icon: CheckCircle
  },
  {
    title: "Climb the Rank",
    description: "See your average scores, track improvement, and rise on the global leaderboard.",
    icon: Trophy
  },
];

const IconWrapper = ({ icon: IconComponent }) => (
  <div className="d-flex align-items-center justify-content-center icon-bg-custom rounded-circle mx-auto mb-3">
    <IconComponent size={24} className="text-primary" />
  </div>
);

const Home = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Header */}
      <header className="bg-white shadow-sm sticky-top">
        <div className="container py-3 d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0 text-primary fw-bold">
            AUTOMATED CONTENT SUBMISSION & EVALUATION
          </h1>
          <div className="d-flex gap-2">
            <button
              onClick={onLoginClick}
              className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center"
            >
              <LogIn size={16} className="me-1" />
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className="btn btn-primary btn-sm rounded-pill d-flex align-items-center"
            >
              <UserPlus size={16} className="me-1" />
              Register
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow-1">
        {/* Hero Section - Centered */}
        <section className="bg-white py-5">
          <div className="container text-center py-5">
            <h2 className="display-4 fw-bold mb-3 text-primary">
              Welcome to ACSES
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '500px' }}>
              The automated platform for video submission, authentic evaluation and competitive ranking.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-5 bg-light">
          <div className="container">
            <h3 className="h2 fw-bold text-center text-dark mb-5">
              How It Works
            </h3>
            <div className="row g-4 justify-content-center">
              {valueProps.map((prop, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card p-4 h-100 border-0 rounded-3 shadow-sm hover-card">
                    <div className="text-center">
                      <IconWrapper icon={prop.icon} />
                    </div>
                    <div className="card-body p-0 text-center">
                      <h4 className="h5 fw-bold text-dark mb-2">
                        {index + 1}. {prop.title}
                      </h4>
                      <p className="text-muted small mb-0">
                        {prop.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 bg-dark text-white">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <small className="mb-2 mb-md-0 text-muted">
            &copy; {new Date().getFullYear()} Automated Content Submission and Evaluation. All rights reserved.
          </small>
          <div className="small">
            <a href="#!" className="text-muted text-decoration-none me-3">Privacy</a>
            <a href="#!" className="text-muted text-decoration-none me-3">Terms</a>
            <a href="#!" className="text-muted text-decoration-none">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        .icon-bg-custom {
          background-color: rgba(13, 110, 253, 0.1);
          padding: 18px;
          height: 60px;
          width: 60px;
        }
        
        .hover-card {
          transition: all 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;