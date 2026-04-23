# Migration Pipeline Scripts

Step-by-step scripts that migrate a frontend application from one PatternFly version to another. Each script handles one stage of the pipeline, sourcing a shared `config.sh` for all paths and settings.

The default example migrates [quipucords-ui](https://github.com/jwmatthews/quipucords-ui) (branch `original_2.1.0`) from PatternFly 5.3.3 to 6.4.1.

## Files

| File | Purpose |
|---|---|
| `config.sh` | Shared configuration: repo URLs, version tags, binary paths, work directories |
| `00_clone.sh` | Clones patternfly-react, patternfly (CSS), and the target app repo |
| `01_create_rules.sh` | Runs `semver-analyzer` to detect API changes and generate Konveyor migration rules |
| `02_analyze_app.sh` | Starts `frontend-analyzer-provider`, runs `kantra` to find violations, outputs JSON |
| `03_run_fix_engine.sh` | Applies pattern-based and LLM-based fixes via `fix-engine-cli`, commits results |
| `04_run_agent.sh` | Runs an AI agent (goose, claude, or opencode) to fix remaining build/test failures |

## Prerequisites

- **nvm** with Node 18 and 20 installed
- **Java** (JDK 21+) with `JAVA_HOME` set — required by kantra
- **yq** or **python3** (with PyYAML) — for YAML-to-JSON conversion
- **goose** (default agent), or **claude** / **opencode** if using those instead
- The following binaries built and available (paths configured in `config.sh`):
  - `semver-analyzer`
  - `frontend-analyzer-provider`
  - `fix-engine-cli`
  - `kantra`

## Usage

### 1. Review and adjust configuration

Open `config.sh` and verify the binary paths match your local setup. The defaults assume binaries are built from source under `~/synced/`:

```bash
vim config.sh
```

### 2. Clone repositories

```bash
./00_clone.sh
```

This clones patternfly-react, the patternfly CSS repo, and quipucords-ui into `work/repos/`. It also checks out the latest v6 CSS tag. Subsequent runs skip repos that are already cloned.

### 3. Generate migration rules

```bash
./01_create_rules.sh
```

This is the longest step. `semver-analyzer` diffs the public TypeScript API between PatternFly v5.3.3 and v6.4.1, then generates Konveyor-compatible YAML rules. Output goes to `work/rules/`.

### 4. Analyze the target application

```bash
./02_analyze_app.sh
```

Starts the `frontend-analyzer-provider` gRPC server, runs `kantra` to scan quipucords-ui against the generated rules, then converts the YAML output to JSON at `work/analysis/output.json`.

### 5. Apply automated fixes

```bash
./03_run_fix_engine.sh
```

Runs `fix-engine-cli` in two passes — first applying deterministic pattern-based fixes, then LLM-assisted fixes for more complex changes. Commits all automated fixes to the app repo.

### 6. Run the AI agent for remaining issues

Create an `agent_prompt.md` that tells the agent what to do (e.g., "fix all remaining build errors and test failures after the PatternFly 6 migration"), then:

```bash
./04_run_agent.sh              # uses goose (default)
./04_run_agent.sh claude       # use claude instead
./04_run_agent.sh opencode     # use opencode instead
```

The agent runs inside the app repo directory and attempts to resolve whatever the automated fix-engine couldn't handle.

## Customizing for a different project

Edit `config.sh` to point at a different app and PatternFly version range:

```bash
APP_REPO_URL="https://github.com/your-org/your-app.git"
APP_BRANCH="main"
PF_FROM="v5.2.0"
PF_TO="v6.3.0"
```

Then run the scripts in order starting from `00_clone.sh`.
