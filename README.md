<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/pruizlezcano/legato">
    <img src="assets/icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Legato</h3>

  <p align="center">
    The manager for your Ableton projects
    <br />
    <a href="https://pruizlezcano.github.io/legato"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/pruizlezcano/legato/issues">Report Bug</a>
    ·
    <a href="https://github.com/pruizlezcano/legato/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#adding-ableton-projects">Adding Ableton projects</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
![Legato Screen Shot Dark](/docs/src/assets/legato-screenshot-dark.png#gh-dark-mode-only)![Legato Screen Shot Light](/docs/src/assets/legato-screenshot-light.png#gh-light-mode-only)

Welcome to Legato, your ultimate manager for Ableton projects!

Legato simplifies project organization and enhances your workflow, allowing you to focus more on your music creation process and less on file management.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Installation

Before you can start using Legato, you'll need to install it on your system. Follow these steps:

1. **Download Legato:** Visit the [GitHub releases page](https://github.com/pruizlezcano/legato/releases/latest) and download the appropriate version of Legato for your operating system.

2. **Install Legato:** Once the download is complete, follow the installation instructions provided in the installation wizard.

3. **Launch Legato:** After installation, launch Legato from your applications folder or desktop shortcut.

> [!NOTE]
> During the installation you may found some security issues. This ocurs because the installer is not signed by a certificate.
> When you download a file from the internet, **macOS** automatically adds a `quarantine` attribute to it. This attribute is used to trigger certain security measures, such as warning you when you try to open the file, or preventing the file from being opened at all.
> You can remove the `quarantine` attribute by running this command in the Terminal app.
> ```shell
> xattr -d com.apple.quarantine /Applications/Legato.app
>```
>In **Windows** you can ignore the alert and open Legato normaly.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Adding Ableton Projects

Legato seamlessly integrates with your Ableton projects, providing a centralized platform for managing them. In order to connect Legato to your Ableton projects, follow these steps:

1. In Legato, open the settings page.
2. Modify your projects path.
3. Click on the scan button to start adding your Ableton projects to Legato.

Learn more about the scanning modes [here](https://pruizlezcano.github.io/legato/scanning-projects).


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
