import { HydrateClient } from "~/trpc/server";
import MetadataForm from "./metaDataForm";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/shared/sidebar";
import APIHealthCheck from "~/components/api-health-check";

export default async function Home() {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />

        <div className="container mx-auto flex p-4">
          <div className="w-full p-10">
            <APIHealthCheck>
              <MetadataForm />
            </APIHealthCheck>
          </div>
        </div>
      </SidebarProvider>
    </HydrateClient>
  );
}

