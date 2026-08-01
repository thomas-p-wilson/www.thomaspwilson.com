import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { celestialBodies } from "../engine/celestialBodies";
import { piDigitsString } from "../engine/pi";
import { minDigitsForTargetError, positionErrorKm } from "../engine/precision";
import { formatLengthKm, scaleComparison } from "../engine/format";
import { targetPrecisions } from "../engine/targetPrecisions";

const MIN_DIGITS = 1;
const MAX_DIGITS = 45;
const DEFAULT_DIGITS = 6;
const DEFAULT_TARGET_ID = "1km";

export default function PiPrecisionExplorer() {
  const [digits, setDigits] = useState(DEFAULT_DIGITS);
  const [targetId, setTargetId] = useState(DEFAULT_TARGET_ID);

  const target = targetPrecisions.find((t) => t.id === targetId) ?? targetPrecisions[0];
  const piString = piDigitsString(digits);

  const rows = useMemo(
    () =>
      celestialBodies.map((body) => {
        const errorKm = positionErrorKm(digits, body.distanceKm);
        const digitsNeeded = minDigitsForTargetError(body.distanceKm, target.km);
        const meetsTarget = errorKm <= target.km;
        return { body, errorKm, digitsNeeded, meetsTarget };
      }),
    [digits, target]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Digits of &pi; you're using</CardTitle>
          <CardDescription>
            Drag to see how a planet's calculated position drifts when &pi; is truncated to fewer digits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 px-4 py-3 font-mono text-lg sm:text-xl tracking-wide">
            &pi; &asymp; {piString}
          </div>
          <Slider
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            step={1}
            value={[digits]}
            onValueChange={([value]) => setDigits(value)}
            thumbLabel="Digits of pi"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{MIN_DIGITS} digit</span>
            <span className="font-medium text-foreground">{digits} digits</span>
            <span>{MAX_DIGITS} digits</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target precision</CardTitle>
          <CardDescription>
            How accurately do you want to know a body's position? The table below shows the minimum digits of &pi;
            that achieve it — and whether your current slider setting already gets there.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger className="w-full sm:w-96">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {targetPrecisions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position error by body</CardTitle>
          <CardDescription>
            Worst-case drift in a body's computed orbital position, treating its orbit as circular.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Body</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Digits needed for target</TableHead>
                <TableHead>Error at {digits} digits</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ body, errorKm, digitsNeeded, meetsTarget }) => (
                <TableRow key={body.id}>
                  <TableCell className="font-medium">{body.name}</TableCell>
                  <TableCell className="text-muted-foreground">{body.distanceLabel}</TableCell>
                  <TableCell>{digitsNeeded ?? `>${MAX_DIGITS}`}</TableCell>
                  <TableCell>
                    <div>{formatLengthKm(errorKm)}</div>
                    <div className="text-xs text-muted-foreground">{scaleComparison(errorKm)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={meetsTarget ? "default" : "outline"}>
                      {meetsTarget ? "within target" : "falls short"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
