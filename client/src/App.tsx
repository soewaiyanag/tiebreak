import { BrowserRouter, Route, Routes } from "react-router";
import { SessionProvider } from "./lib/session";
import { RequireAuth } from "./components/layout/RequireAuth";
import { Landing } from "./routes/Landing";
import { Guest } from "./routes/Guest";
import { Login } from "./routes/Login";
import { Signup } from "./routes/Signup";
import { Dashboard } from "./routes/Dashboard";
import { PollCreate } from "./routes/PollCreate";
import { PollShare } from "./routes/PollShare";
import { PollView } from "./routes/PollView";
import { Vote } from "./routes/Vote";
import { NotFound } from "./routes/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/app/new"
            element={
              <RequireAuth>
                <PollCreate />
              </RequireAuth>
            }
          />
          <Route
            path="/app/polls/:id/share"
            element={
              <RequireAuth>
                <PollShare />
              </RequireAuth>
            }
          />
          <Route
            path="/app/polls/:id"
            element={
              <RequireAuth>
                <PollView />
              </RequireAuth>
            }
          />
          <Route path="/p/:slug" element={<Vote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
