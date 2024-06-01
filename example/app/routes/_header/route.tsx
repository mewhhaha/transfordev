import { NavLink, Outlet, useLocation } from "@remix-run/react";

export default function Index() {
  const { pathname } = useLocation();

  const segments = pathname.split("/").slice(1);

  return (
    <>
      <header className="flex w-full border-b-2 border-gray-900 p-4">
        <h1 className="text-2xl font-bold tracking-widest">Translations</h1>
        <nav aria-label="Breadcrumb">
          <ol className="flex gap-2">
            {segments.map((segment, i) => {
              const path = segments.slice(0, i + 1).join("/");

              return (
                <li
                  key={`${i},segment`}
                  className={i !== 0 ? "before:mx-1 before:content-['/']" : ""}
                >
                  <NavLink
                    to={path}
                    end
                    className={({ isActive }) => {
                      if (isActive) {
                        return "";
                      } else {
                        return "underline text-blue-500";
                      }
                    }}
                  >
                    {segment}
                  </NavLink>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
