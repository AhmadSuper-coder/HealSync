import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageCircle, CheckCircle, AlertCircle, ExternalLink, Settings, Users, Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface WhatsAppConnection {
  isConnected: boolean;
  phoneNumberId?: string;
  wabaId?: string;
  connectedPhone?: string;
  businessName?: string;
  connectedAt?: string;
}

export default function WhatsApp() {
  const { toast } = useToast();

  // Query for WhatsApp connection status
  const { 
    data: whatsappConnection, 
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus 
  } = useQuery<WhatsAppConnection>({
    queryKey: ['/api/whatsapp/status'],
    staleTime: 30000, // Consider fresh for 30 seconds
  });

  // Mutation for connecting WhatsApp
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/whatsapp/auth/connect');
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error) => {
      console.error('WhatsApp connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to WhatsApp Business API. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for disconnecting WhatsApp
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/whatsapp/auth/disconnect');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
      toast({
        title: "Disconnected",
        description: "WhatsApp Business account has been disconnected.",
      });
    },
    onError: (error) => {
      console.error('WhatsApp disconnection error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnectWhatsApp = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleRefreshStatus = () => {
    refetchStatus();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
          <SiWhatsapp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <p className="text-muted-foreground">Connect your WhatsApp Business account to message patients</p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : statusError ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Error
                </Badge>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to check WhatsApp connection status. Please try refreshing.
                </AlertDescription>
              </Alert>
            </div>
          ) : whatsappConnection?.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Business Name</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-business-name">
                    {whatsappConnection?.businessName || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-phone">
                    {whatsappConnection?.connectedPhone || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Connected At</p>
                  <p className="text-sm text-muted-foreground">
                    {whatsappConnection?.connectedAt ? new Date(whatsappConnection.connectedAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-green-600 font-medium" data-testid="status-connection">Active</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  data-testid="button-disconnect-whatsapp"
                >
                  {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Account"}
                </Button>
                <Button 
                  variant="outline"
                  disabled={statusLoading}
                  data-testid="button-refresh-status"
                  onClick={handleRefreshStatus}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {statusLoading ? "Refreshing..." : "Refresh Status"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Not Connected
                </Badge>
              </div>
              
              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your WhatsApp Business account to start messaging patients directly from the platform.
                  You'll need a Facebook Business Manager account and WhatsApp Business API access.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleConnectWhatsApp}
                disabled={connectMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-connect-whatsapp"
              >
                <SiWhatsapp className="h-4 w-4 mr-2" />
                {connectMutation.isPending ? "Connecting..." : "Connect WhatsApp Business"}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patient Messaging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Send appointment reminders, prescription details, and health updates to patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4" />
              Two-Way Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive and respond to patient queries in real-time through WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Automated Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up automated messages for follow-ups, medicine reminders, and health tips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      {!whatsappConnection?.isConnected && !statusLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Facebook Business Manager</p>
                  <p className="text-sm text-muted-foreground">
                    You need a Facebook Business Manager account with WhatsApp Business API access
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">WhatsApp Business Account</p>
                  <p className="text-sm text-muted-foreground">
                    Your WhatsApp Business account should be verified and connected to your Facebook Business Manager
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Connect Account</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Connect WhatsApp Business" to authorize our application to send messages on your behalf
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}