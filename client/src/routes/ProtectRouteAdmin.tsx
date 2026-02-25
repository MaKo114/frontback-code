import useTestStore from "@/store/tokStore";
import { useEffect, useState, type ReactElement } from "react";
import LoadingToRedirect from "./LoadingToRedirect";
import { requireAdmin } from "@/api/auth";

interface ProtectRouteUserProps {
  element: ReactElement;
}

const ProtectRouteAdmin = ({ element }: ProtectRouteUserProps) => {
  const [ok, setOk] = useState(false);
  const user = useTestStore((s) => s.user);
  const token = useTestStore((s) => s.token);

  useEffect(() => {
    if (user && token) {
      requireAdmin(token)
        .then((res) => setOk(true))
        .catch((err) => setOk(false));
    }
  }, []);

  return ok ? element : <LoadingToRedirect />;
};

export default ProtectRouteAdmin;
