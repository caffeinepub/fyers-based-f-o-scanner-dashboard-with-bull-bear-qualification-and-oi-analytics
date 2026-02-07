import { useState, useEffect } from 'react';
import { useGetStatus, useSaveCreds, useClearCreds } from '../hooks/useFyersConnection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FyersConnectionForm() {
  const { data: status, isLoading: statusLoading } = useGetStatus();
  const saveCreds = useSaveCreds();
  const clearCreds = useClearCreds();

  const [clientId, setClientId] = useState('');
  const [secret, setSecret] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [expiry, setExpiry] = useState('');

  const isConnected = status === 'CONNECTED';
  const isExpired = status === 'EXPIRED';
  const isNotConnected = status === 'NOT_CONNECTED';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId.trim() || !secret.trim() || !redirectUrl.trim() || !accessToken.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    let expiryTimestamp: bigint;
    try {
      if (expiry.trim()) {
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) {
          toast.error('Invalid expiry date format');
          return;
        }
        expiryTimestamp = BigInt(expiryDate.getTime()) * BigInt(1_000_000);
      } else {
        expiryTimestamp = BigInt(0);
      }
    } catch (error) {
      toast.error('Invalid expiry date');
      return;
    }

    try {
      await saveCreds.mutateAsync({
        clientId: clientId.trim(),
        secret: secret.trim(),
        redirectUrl: redirectUrl.trim(),
        accessToken: accessToken.trim(),
        refreshToken: refreshToken.trim(),
        expiry: expiryTimestamp
      });
      toast.success('Fyers credentials saved successfully');
    } catch (error) {
      toast.error('Failed to save credentials. Please try again.');
      console.error('Save credentials error:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await clearCreds.mutateAsync();
      setClientId('');
      setSecret('');
      setRedirectUrl('');
      setAccessToken('');
      setRefreshToken('');
      setExpiry('');
      toast.success('Fyers credentials cleared');
    } catch (error) {
      toast.error('Failed to clear credentials');
      console.error('Clear credentials error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Connection Status:</span>
          {statusLoading ? (
            <Badge variant="outline">Loading...</Badge>
          ) : isConnected ? (
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : isExpired ? (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              Expired
            </Badge>
          ) : (
            <Badge variant="outline">
              <XCircle className="mr-1 h-3 w-3" />
              Not Connected
            </Badge>
          )}
        </div>
        
        {(isConnected || isExpired) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={clearCreds.isPending}
          >
            {clearCreds.isPending ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        )}
      </div>

      {isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your Fyers credentials have expired. Please update your access token and expiry date.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID *</Label>
          <Input
            id="clientId"
            placeholder="Enter your Fyers client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret">Secret Key *</Label>
          <Input
            id="secret"
            type="password"
            placeholder="Enter your Fyers secret key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirectUrl">Redirect URL *</Label>
          <Input
            id="redirectUrl"
            placeholder="Enter your redirect URL"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessToken">Access Token *</Label>
          <Input
            id="accessToken"
            type="password"
            placeholder="Enter your access token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="refreshToken">Refresh Token</Label>
          <Input
            id="refreshToken"
            type="password"
            placeholder="Enter your refresh token (optional)"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry">Token Expiry</Label>
          <Input
            id="expiry"
            type="datetime-local"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty if token doesn't expire
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={saveCreds.isPending}
        >
          {saveCreds.isPending ? 'Saving...' : 'Save Credentials'}
        </Button>
      </form>
    </div>
  );
}
