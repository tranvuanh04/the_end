import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import EnvelopePage from './pages/EnvelopePage';
import TheEndPage from './pages/TheEndPage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import AdminPage from './pages/AdminPage';

// Smooth page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    filter: 'blur(4px)',
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.5,
};

function AppFlow() {
  const [stage, setStage] = useState<'envelope' | 'theend' | 'members'>('envelope');
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      {stage === 'envelope' && (
        <motion.div
          key="envelope"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <EnvelopePage onComplete={() => setStage('theend')} />
        </motion.div>
      )}

      {stage === 'theend' && (
        <motion.div
          key="theend"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.6 }}
        >
          <TheEndPage
            onComplete={() => {
              setStage('members');
              navigate('/members');
            }}
          />
        </motion.div>
      )}

      {stage === 'members' && (
        <motion.div
          key="members"
          initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <MembersPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated route wrapper for member detail pages
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/members"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <MembersPage />
            </motion.div>
          }
        />
        <Route
          path="/member/:id"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <MemberDetailPage />
            </motion.div>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppFlow />} />
        <Route path="/*" element={<AnimatedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
