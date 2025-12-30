import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Stack, TextField } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const SuggestImprovementModal = ({ open, onClose, mode = 'suggest', onSubmit }) => {
  const [statusText, setStatusText] = React.useState('');
  const [reasonText, setReasonText] = React.useState('');

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ status: mode, text: reasonText || statusText });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {mode === 'reject' ? 'Reject' : 'Suggest Improvement'}
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="Your Suggestion"
            multiline
            rows={4}
            variant="standard"
            fullWidth
            value={reasonText}
            onChange={(e)=>setReasonText(e.target.value)}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SuggestImprovementModal;
