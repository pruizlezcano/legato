
## [0.4.0](https://github.com/pruizlezcano/legato/compare/v0.3.0...v0.4.0) (2025-04-23)

Legato now seamlessly integrates with your workflow through background operation capabilities. You can minimize the app to your system tray while scheduled scans run automatically based on customizable cron expressions, and optionally have Legato start automatically at login.

The interface has been refreshed with a reorganized settings panel, updated icons, and smoother visuals throughout the application.

### Features

* Added auto-start functionality for application launch at login ([1b6c5f9](https://github.com/pruizlezcano/legato/commit/1b6c5f9756295c4ed2a56a514a7a92e472c54097))
* Added background scan scheduling and UI integration ([0c1564e](https://github.com/pruizlezcano/legato/commit/0c1564e683479022ac84681473073a4607d8b18f))
* Added minimize to tray functionality ([9109aac](https://github.com/pruizlezcano/legato/commit/9109aac0c30c2caa363aaac61b6a6fce13ade1b4))
* Added scan cancellation and quit confirmation logic ([f04249d](https://github.com/pruizlezcano/legato/commit/f04249da6c6748dda69e47e6e5c0175f56279858))
* Added start minimized to tray functionality ([d375b45](https://github.com/pruizlezcano/legato/commit/d375b45f85dfe8ab4563d25a41bb473db3e3f55f))
* **projectScanner:** Notify main window on scan completion or error ([85b925a](https://github.com/pruizlezcano/legato/commit/85b925aea5cf83df8acc9c04ed255e6eb586ad01))
* **settings:** Improved settings UI layout and organization for better user experience ([adfbcc9](https://github.com/pruizlezcano/legato/commit/adfbcc911b782b891aa07b9676ce168ad53b59f3))
* **tray:** Added notification for ongoing project scans when restoring window ([2627351](https://github.com/pruizlezcano/legato/commit/2627351ec7458389e9f83e14c49abc71c654f6b3))


### Bug Fixes

* Correct typo in TO_DO progress color class ([6457940](https://github.com/pruizlezcano/legato/commit/64579407aff679ce17dba832986464c079d181a1))
* Prevent UI flashing during initial load ([29a10fb](https://github.com/pruizlezcano/legato/commit/29a10fb85bfb36f5f10e25f19623fab155fed142))
* **settings:** `autoStart` not being initialized ([3e339af](https://github.com/pruizlezcano/legato/commit/3e339aff1ab23da679b648c3a6eefe57abf56702))

## [0.3.0](https://github.com/pruizlezcano/legato/compare/v0.2.0...v0.3.0) (2024-12-17)


### Features

* Added column visibility toggle ([1a0e74f](https://github.com/pruizlezcano/legato/commit/1a0e74fce6d418bb33c817d800823625bd5b66dc))
* Added table state persistence for sorting, page size, and displayed columns ([5794023](https://github.com/pruizlezcano/legato/commit/5794023f3af124d912467c2aad21c2ddb3d99b68))
* **project:** Added new project progress states and color coding ([a7b1906](https://github.com/pruizlezcano/legato/commit/a7b19066a460bf950c84ed0d7076a57a7a907976))
* Return to first page when changing filter ([03cd354](https://github.com/pruizlezcano/legato/commit/03cd3547bdc225fb4397d2b6596146fb6350b8ea))
* **ui:** Added skeleton during table load ([7886d37](https://github.com/pruizlezcano/legato/commit/7886d373e83555639ff55922ed6a327040bdbfe2))


### Bug Fixes

* **tsc:** Resolve Typescript errors ([d80a8bb](https://github.com/pruizlezcano/legato/commit/d80a8bb8f728cdd416cadf89202563f59916f6b3))
* **ui:** Adjust margin for header badges ([c3c6ead](https://github.com/pruizlezcano/legato/commit/c3c6ead9d108f32895606b9a67c371630ad3c298))
* **ui:** Update project saving logic to use accessorKey for column updates ([8d3d6fb](https://github.com/pruizlezcano/legato/commit/8d3d6fb927758665a292282651285dfa1e5a39e6))

## [0.2.0](https://github.com/pruizlezcano/legato/compare/v0.1.0...v0.2.0) (2024-03-19)


### Features

* Add DAW field to project details ([#44](https://github.com/pruizlezcano/legato/issues/44)) ([fa3ffe8](https://github.com/pruizlezcano/legato/commit/fa3ffe8f6d81c4761c12a78cb56310f4ed397ea8))
* Add functionality to automatically detect and set audio file in project processing. ([#46](https://github.com/pruizlezcano/legato/issues/46)) ([56e970c](https://github.com/pruizlezcano/legato/commit/56e970c280b36e8c4099336fc935f3c6f675a150))
* Add warning toast for IPC warning event ([ff31dc6](https://github.com/pruizlezcano/legato/commit/ff31dc693db85fe663b5744053ccc031282a57c5))
* **ProjectsTable:** Added better text filtering functionality ([#45](https://github.com/pruizlezcano/legato/issues/45)) ([b7f0faa](https://github.com/pruizlezcano/legato/commit/b7f0faa818ff86238762076f28cb2a7bc1b589cc))


### Bug Fixes

* Ensure saving project when values have change ([ea7668e](https://github.com/pruizlezcano/legato/commit/ea7668e3f3c7c5c38936a3fab3b4bf915e81bfdc))
* Prevent the title input to be selected when opening Project Details ([9d9f86e](https://github.com/pruizlezcano/legato/commit/9d9f86e9302e913c9c464f300b92331e6b3fdeb5))
