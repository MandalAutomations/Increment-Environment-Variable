import { getInput, setFailed, warning, info } from "@actions/core";
import { getOctokit } from "@actions/github";

const repoId = getInput("RepoId");
const environmentName = getInput("EnvironmentName");
const rawName = getInput("Name");
const name = rawName.replace(/\s/g, "_");
if (name !== rawName) {
    warning(`Variable name "${rawName}" contains whitespace; normalized to "${name}".`);
}
const token = getInput("Token");

const octokit = getOctokit(token);

const getEnvironmentVariable = () =>
    octokit.request(
        `GET /repositories/${repoId}/environments/${environmentName}/variables/${name}`,
        { name }
    );

const updateEnvironmentVariable = (newValue) =>
    octokit.request(
        `PATCH /repositories/${repoId}/environments/${environmentName}/variables/${name}`,
        { name, value: newValue }
    );

const createEnvironmentVariable = (newValue) =>
    octokit.request(
        `POST /repositories/${repoId}/environments/${environmentName}/variables`,
        { name, value: newValue }
    );

const incrementEnvironmentVariable = async () => {
    let existing;
    try {
        existing = await getEnvironmentVariable();
    } catch (error) {
        if (error.status !== 404) throw error;
    }

    if (!existing) {
        try {
            await createEnvironmentVariable("1");
            info(`Created ${name}=1 in environment ${environmentName}.`);
            return;
        } catch (error) {
            // Race: another job created it between our GET and POST. Fall through to update.
            if (error.status !== 422) throw error;
            existing = await getEnvironmentVariable();
        }
    }

    const current = existing.data.value;
    if (!/^[0-9]+$/.test(current)) {
        warning(`Variable ${name} has non-numeric value "${current}"; skipping increment.`);
        return;
    }

    const next = (parseInt(current, 10) + 1).toString();
    await updateEnvironmentVariable(next);
    info(`Incremented ${name}: ${current} -> ${next}.`);
};

try {
    await incrementEnvironmentVariable();
} catch (error) {
    setFailed(error.message);
}
