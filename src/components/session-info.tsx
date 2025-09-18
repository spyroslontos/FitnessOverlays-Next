import { auth } from "@/lib/auth";

export async function SessionInfo() {
  const session = await auth();

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Session Data</h3>
      {!session ? (
        <div>Not logged in</div>
      ) : (
        <pre className="text-xs p-2 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      )}
    </div>
  );
}
