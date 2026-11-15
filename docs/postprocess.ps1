$ErrorActionPreference = "Stop"
$log = "D:\Dsh house\projects\mock-server\docs\postprocess.log"
"start $(Get-Date -Format HH:mm:ss)" | Out-File -Encoding utf8 $log
$src = "D:\Dsh house\projects\mock-server\docs\比赛材料\新源村情通-作品说明.docx"
$pdf = "D:\Dsh house\projects\mock-server\docs\比赛材料\新源村情通-作品说明.pdf"
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($src, $false, $false)
    "opened" | Out-File -Append -Encoding utf8 $log
    $placed = $false
    foreach ($p in $doc.Paragraphs) {
        if ($p.Range.Text -like "*[[TOC]]*") {
            $r = $p.Range
            $r.Text = ""
            $toc = $doc.TablesOfContents.Add($r, $true, 1, 3, $false, "", $true, $true, $true, $true)
            $toc.Update()
            $placed = $true
            "toc added" | Out-File -Append -Encoding utf8 $log
            break
        }
    }
    "placed=$placed" | Out-File -Append -Encoding utf8 $log
    $doc.Repaginate()
    $doc.Save()
    "saved docx" | Out-File -Append -Encoding utf8 $log
    $doc.ExportAsFixedFormat($pdf, 17)
    "exported pdf" | Out-File -Append -Encoding utf8 $log
    $doc.Close(0)
} catch {
    "ERROR: " + $_.Exception.Message | Out-File -Append -Encoding utf8 $log
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
"done" | Out-File -Append -Encoding utf8 $log
