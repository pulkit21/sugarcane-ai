import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  Radio,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { PackageOutput as pp } from "~/validators/prompt_package";
import {
  DeployTemplateInput,
  TemplateOutput as pt,
} from "~/validators/prompt_template";
import { VersionOutput as pv } from "~/validators/prompt_version";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { PromptIntegration } from "./integration/prompt_integration";
import { VersionSchema } from "~/validators/prompt_version";

function PromptDeploy({
  ns,
  pp,
  pt,
  pv,
  onTemplateUpdate,
}: {
  ns: any;
  pp: pp;
  pt: pt;
  pv: VersionSchema;
  onTemplateUpdate: Function;
}) {
  const [open, setOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [changelog, setChangelog] = useState(pv.changelog);

  const [environmentType, setEnvironmentType] = React.useState("preview");
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("Choose wisely");

  const handleDeployOption = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvironmentType((event.target as HTMLInputElement).value);
    setHelperText("This action cannot be undone.");
    setError(false);
  };

  const deployMutation = api.prompt.deployTemplate.useMutation({
    onSuccess: (data: any) => {
      console.log(">>>>>>>>>>> Deployed");
      console.log(data.pt);
      console.log(data.pv);
      console.log("<<<<<<<< Deployed");
      if (data.pv !== null) {
        pv = data.pv;
        onTemplateUpdate(data.pt);
        setIsDeploying(false);
        setDeploymentSuccess(true);
        toast.success("Deployed Successfully");
      }
    },
  });

  const handleDeployCode = () => {
    // Start deployment animation
    setIsDeploying(true);

    deployMutation.mutate({
      promptTemplateId: pv.promptTemplateId,
      promptPackageId: pt?.promptPackageId,
      promptVersionId: pv.id,

      environment: environmentType,
      changelog: changelog,
    } as DeployTemplateInput);

    // Simulate deployment delay with a timeout (you can replace this with your actual deployment logic)
    // setTimeout(() => {
    //     // Stop deployment animation and show success
    //     setIsDeploying(false);
    //     setDeploymentSuccess(true);

    // }, 2000); // Adjust the timeout duration to simulate deployment time
  };

  const handleChangelog = (text: string) => {
    setChangelog(text);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setTimeout(() => {
      // Stop deployment animation and show success
      setIsDeploying(false);
      setDeploymentSuccess(false);
    }, 1000);
  };

  return (
    <span>
      <Button color="success" variant="text" onClick={handleOpenModal}>
        <RocketLaunchIcon></RocketLaunchIcon>
      </Button>
      <Dialog sx={{ m: 2, p: 2 }} open={open} onClose={handleCloseModal}>
        <DialogTitle>Deploy Prompt via API</DialogTitle>
        <DialogContent>
          <Typography></Typography>
          <Typography gutterBottom variant="h5" component="div"></Typography>
          <Typography variant="body2" color="text.secondary"></Typography>
          {isDeploying ? (
            <div>
              <CircularProgress />
              <p>Deploying prompt...</p>
            </div>
          ) : deploymentSuccess ? (
            <div>
              <p>Deployment successful!</p>
              <p>You can access it over the API</p>
              <PromptIntegration
                ns={ns}
                pp={pp}
                pt={pt}
                pv={pv as pv}
              ></PromptIntegration>
              <Button color="primary" autoFocus onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          ) : (
            <div>
              <form onSubmit={handleDeployCode}>
                <FormControl sx={{ m: 3 }} error={error} variant="standard">
                  <FormLabel id="deployType">Environment</FormLabel>
                  <RadioGroup
                    aria-labelledby="environment type"
                    name="Environment Type"
                    value={environmentType}
                    onChange={handleDeployOption}
                  >
                    <FormControlLabel
                      value="preview"
                      control={<Radio />}
                      label="Preview"
                    />
                    <FormControlLabel
                      value="release"
                      control={<Radio />}
                      label="Release"
                    />
                  </RadioGroup>
                  <FormHelperText>{helperText}</FormHelperText>

                  <TextField
                    sx={{ mt: 4 }}
                    minRows={5}
                    maxRows={10}
                    label="Changelog"
                    variant="outlined"
                    fullWidth
                    value={changelog}
                    onChange={(e) => handleChangelog(e.target.value)}
                    // onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />

                  <Typography
                    sx={{ mt: 4 }}
                    variant="body2"
                    color="text.secondary"
                  >
                    <p>Are you sure you want to deploy the code?</p>
                    <p>This action cannot be undone.</p>
                  </Typography>

                  {/* <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
                                        Check Answer
                                        </Button> */}
                </FormControl>
              </form>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {isDeploying ? null : deploymentSuccess ? null : (
            <Button onClick={handleCloseModal} color="primary">
              Cancel
            </Button>
          )}
          {isDeploying ? null : deploymentSuccess ? null : (
            <Button onClick={handleDeployCode} color="primary">
              Deploy
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </span>
  );
}

export default PromptDeploy;
