# Workspace Agent Rules

## Shortcuts & Commands

- **/play**: When the user sends `/play` or asks to play Minecraft / FreakLand Create Fan, immediately launch the game using the `play` skill or run:
  ```powershell
  Start-Process -FilePath "C:\Users\user\AppData\Local\Programs\PrismLauncher\prismlauncher.exe" -ArgumentList @("--launch", "FreakLand Create Fan")
  ```
