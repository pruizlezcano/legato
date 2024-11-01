Welcome to `legato` contributor's guide.

This document focuses on getting any potential contributor familiarized with the development processes, but [other kinds of contributions] are also appreciated.

If you are new to using [git] or have never collaborated in a project previously, please have a look at [contribution-guide.org]. Other resources are also listed in the excellent [guide created by FreeCodeCamp] [^contrib1].

Please notice, all users and contributors are expected to be **open, considerate, reasonable, and respectful**. When in doubt, [Python Software Foundation's Code of Conduct] is a good reference in terms of behavior guidelines.

## Issue Reports

If you experience bugs or general issues with `legato`, please have a look on the [issue tracker].
If you don't see anything useful there, please feel free to fire an issue report.

> Please don't forget to include the closed issues in your search.
> Sometimes a solution was already reported, and the problem is considered **solved**.

New issue reports should include information about your programming environment (e.g., operating system, Ableton version) and steps to reproduce the problem.

Please try also to simplify the reproduction steps to a very minimal example that still illustrates the problem you are facing. By removing other factors, you help us to identify the root cause of the issue.

## Documentation Improvements

You can help improve `legato` docs by making them more readable and coherent, or by adding missing information and correcting mistakes.

`legato` documentation uses [Astro] and [Starlight].
This means that the docs are kept in the same repository as the project code, and that any documentation update is done in the same way was a code contribution.


>   Please notice that the [GitHub web interface] provides a quick way of propose changes in `legato`'s files. While this mechanism can be tricky for normal code contributions, it works perfectly fine for contributing to the docs, and can be quite handy.
> If you are interested in trying this method out, please navigate to the `docs/src/content` folder in the source [repository], find which file you would like to propose changes and click in the little pencil icon at the top, to open [GitHub's code editor]. Once you finish editing the file, please write a message in the form at the bottom of the page describing which changes have you made and what are the motivations behind them and submit your proposal.


## Code Contributions

### Prequisites

- [Node.js] ^22
- [pnpm] ^9

### Submit an issue

Before you work on any non-trivial code contribution it's best to first create a report in the [issue tracker] to start a discussion on the subject.

This often provides additional considerations and avoids unnecessary work.

### Clone the repository

1. Create an user account on GitHub if you do not already have one.

2. Fork the project [repository]: click on the *Fork* button near the top of the page. This creates a copy of the code under your account on GitHub.

3. Clone this copy to your local disk:
    ```
    git clone git@github.com:YourLogin/legato.git
    cd legato
    ```

4. Install dependencies
    ```
    pnpm install
    ```

### Implement your changes

1. Create a branch to hold your changes:

    ```
    git checkout -b my-feature
    ```
    and start making changes. Never work on the main branch!

2. Start your work on this branch. Don't forget to add [docstrings] to new functions, modules and classes.
   
3. Run legato:
    ```
    pnpm start
    ```
    This will start legato in hot reload mode, that means that any change in the code will be added to the app in real time.
    To stop the application, you can use the Ctrl+C command in the terminal where the application is running.

4. When you’re done editing, do:
    ```
    git add <MODIFIED FILES>
    ```
    to record your changes in [git].


   > Don't forget to add unit tests and documentation in case your contribution adds an additional feature and is not just a bugfix.

    To commit your changes, please use the [conventional commits] specification.

5. Please check that your changes don't break any unit tests with:
    ```
    pnpm test
    ```
  
    and check the code style
    ```
    npm lint
    ```
    or
    ```
    pnpm lint
    ```

### Submit your contribution

1. If everything works fine, push your local branch to the remote server with:
    ```
    git push -u origin my-feature
    ```

2. Go to the web page of your fork and click "Create pull request" to send your changes for review.
    >Find more detailed information in [creating a PR].

---

[^contrib1]: Even though, these resources focus on open source projects and communities, the general ideas behind collaborating with other developers to collectively create software are general and can be applied to all sorts of environments, including private companies and proprietary code bases.


[Astro]: https://astro.build/
[contribution-guide.org]: http://www.contribution-guide.org/
[conventional commits]: https://www.conventionalcommits.org/
[creating a pr]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[docstrings]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
[git]: https://git-scm.com
[github web interface]: https://docs.github.com/en/github/managing-files-in-a-repository/managing-files-on-github/editing-files-in-your-repository
[github's code editor]: https://docs.github.com/en/github/managing-files-in-a-repository/managing-files-on-github/editing-files-in-your-repository
[github's fork and pull request workflow]: https://guides.github.com/activities/forking/
[guide created by freecodecamp]: https://github.com/freecodecamp/how-to-contribute-to-open-source
[Node.js]: https://nodejs.org/en
[other kinds of contributions]: https://opensource.guide/how-to-contribute
[pnpm]: https://pnpm.io/
[python software foundation's code of conduct]: https://www.python.org/psf/conduct/
[Starlight]: https://starlight.astro.build/


[repository]: https://github.com/pruizlezcano/legato
[issue tracker]: https://github.com/pruizlezcano/legato/issues
