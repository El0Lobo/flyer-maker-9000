@echo off
setlocal enabledelayedexpansion

:: Define output JSON file
set output_file=fonts.json

:: Start JSON
(
echo {
) > "%output_file%"

:: Process all top-level folders under "material/images/"
for /d %%d in (material\fonts\*) do (
    set "top_folder=%%~nxd"
    echo Processing category: !top_folder!
    echo   "!top_folder!": { >> "%output_file%"

    :: Process subfolders within the top-level folder
    set first_subfolder=1
    for /d %%s in ("%%d\*") do (
        set "subfolder=%%~nxs"
        if "!first_subfolder!"=="1" (
            echo     "!subfolder!": [ >> "%output_file%"
            set first_subfolder=0
        ) else (
            echo , >> "%output_file%"
            echo     "!subfolder!": [ >> "%output_file%"
        )

        :: Process files in the subfolder
        set first_file=1
        for %%f in ("%%s\*.*") do (
            set "relative_path=%%~f"
            set "relative_path=!relative_path:%cd%\=!"
            set "relative_path=!relative_path:\=/!"  :: Convert backslashes to forward slashes
            set "file_name=%%~nf"
            if "!first_file!"=="1" (
                echo       { "name": "!file_name!", "file": "!relative_path!" } >> "%output_file%"
                set first_file=0
            ) else (
                echo       ,{ "name": "!file_name!", "file": "!relative_path!" } >> "%output_file%"
            )
        )

        :: Close the subfolder section
        echo     ] >> "%output_file%"
    )

    :: Process files directly in the top-level folder
    if exist "%%d\*.*" (
        if "!first_subfolder!"=="0" (
            echo , >> "%output_file%"
        )
        echo     "root": [ >> "%output_file%"

        set first_file=1
        for %%f in ("%%d\*.*") do (
            set "relative_path=%%~f"
            set "relative_path=!relative_path:%cd%\=!"
            set "relative_path=!relative_path:\=/!"  :: Convert backslashes to forward slashes
            set "file_name=%%~nf"
            if "!first_file!"=="1" (
                echo       { "name": "!file_name!", "file": "!relative_path!" } >> "%output_file%"
                set first_file=0
            ) else (
                echo       ,{ "name": "!file_name!", "file": "!relative_path!" } >> "%output_file%"
            )
        )
        echo     ] >> "%output_file%"
    )

    :: Close the top-level folder
    echo   }, >> "%output_file%"
)

:: Close JSON
(
echo }
) >> "%output_file%"

:: Remove trailing commas using PowerShell
powershell -Command "& { (Get-Content '%output_file%') -replace ',(?=\s+\})', '' -replace ',(?=\s+\])', '' | Set-Content '%output_file%' }"

echo JSON successfully generated as %output_file%.
pause
