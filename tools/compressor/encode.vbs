' *==============================================================================*
' * CMD �����б���ת�����߰���GB2312,UTF-8,Unicode,BIG5 *
' * encode.vbs     BY: colinlin1982@sohu.com         2010-07-01 *
' *==============================================================================*
Usage1 = "�﷨����encode.vbs [������][Ŀ¼][�ļ���] <charset>��ֱ���滻ԭ�ļ�ģʽ��"
Usage2 = "�﷨����encode.vbs [������][Ŀ¼][�ļ���] [Ŀ��������][Ŀ¼][������] <charset> /��"
Usage3 = "        ���Ŀ�����ļ��Ѵ��ڣ�ʹ��/�ٲ�����ֱ���滻������ʾ�Ƿ��д��  "
Usage4 = "�����б���ת������ BY: colinlin1982@sohu.com"
Set objArgs=WScript.Arguments
Set fso=CreateObject("Scripting.FileSystemObject")
if objArgs.Count < 2 Then
	WScript.Echo(Usage1)
	WScript.Echo(Usage2)
	WScript.Echo(Usage3)
	WScript.Echo(Usage4)
	Wscript.Quit
end if
if not objArgs.Count < 4 Then
	' ��������
    Options="/y"
    ignoring=StrComp(objArgs(3), Options, vbTextCompare)
    if ignoring = 0 Then
        Sourcefile=objArgs(0)
        Getfile=objArgs(1)
		Charset=objArgs(2)
    else
        MsgBox "�ļ����������̫��        ", vbInformation, "����������ֹ"
        Wscript.Quit
    end if
else
    if not objArgs.Count < 3 Then
        Sourcefile=objArgs(0)
        Getfile=objArgs(1)
		Charset=objArgs(2)
        if fso.FileExists(Getfile) then
            Choice = MsgBox ("�������ļ� '"+Sourcefile+"' ==> Ŀ���ļ� '"+Getfile+"'    "&vbCrLf&"Ŀ���ļ� '"+Getfile+"' �Ѵ��ڣ��Ƿ񸲸������ļ���",vbQuestion+vbYesNo,"ȷ�ϸ���Ŀ���ļ�")
            if not Choice = vbYes Then
                Wscript.Quit
            end if
        end if
    else
        Sourcefile=objArgs(0)
        Getfile=objArgs(0)
		Charset=objArgs(1)
    end if
end if

Call WriteToFile(Getfile, ReadFile(Sourcefile), Charset)
Wscript.Quit
'* �ж��ļ�����
Function GetCode (Sourcefile)
    Dim slz
    set slz = CreateObject("Adodb.Stream")
    slz.Type = 1
    slz.Mode = 3
    slz.Open
    slz.Position = 0
    slz.Loadfromfile Sourcefile
    Bin=slz.read(2)
    if AscB(MidB(Bin,1,1))=&HEF and AscB(MidB(Bin,2,1))=&HBB Then
        codes="UTF-8"
	elseif AscB(MidB(Bin,1,1))=&HFF and AscB(MidB(Bin,2,1))=&HFE Then
		codes="Unicode"
	else
		codes="GB2312"
    end if
    slz.Close
    set slz = Nothing
	GetCode = codes
End Function
'* ��ȡ�ļ�
Function ReadFile(Sourcefile)
    Dim Str
	oldChartset = GetCode(Sourcefile)
    Set stm = CreateObject("Adodb.Stream")
    stm.Type = 2
    stm.mode = 3
    stm.charset = oldChartset
    stm.Open
    stm.loadfromfile Sourcefile
    Str = stm.readtext
    stm.Close
    Set stm = Nothing
    ReadFile = Str
End Function
'* д���ļ�
Function WriteToFile (Getfile, Str, CharSet)
    Set stm = CreateObject("Adodb.Stream")
    stm.Type = 2
    stm.mode = 3
    stm.charset = CharSet
    stm.Open
    stm.WriteText Str
    stm.SaveToFile Getfile,2
    stm.flush
    stm.Close
    Set stm = Nothing
End Function