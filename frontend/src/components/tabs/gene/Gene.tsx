import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card"

export default function Gene() {
  return (
    <Card tone="reference">
      <CardHeader>
        <CardTitle>Gene Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 italic">Data not part of this prototype.</p>
      </CardContent>
    </Card>
  )
}
