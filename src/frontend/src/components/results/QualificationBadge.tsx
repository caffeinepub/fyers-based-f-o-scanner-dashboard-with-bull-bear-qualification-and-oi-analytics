import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Status } from '../../backend';

interface QualificationBadgeProps {
  status: Status;
}

export default function QualificationBadge({ status }: QualificationBadgeProps) {
  if (status === Status.qualified) {
    return (
      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Qualified
      </Badge>
    );
  }

  if (status === Status.ignored) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <MinusCircle className="mr-1 h-3 w-3" />
        Ignored
      </Badge>
    );
  }

  if (status === Status.disqualified) {
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Disqualified
      </Badge>
    );
  }

  return (
    <Badge variant="outline">Unknown</Badge>
  );
}
