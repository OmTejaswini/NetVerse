import React from 'react';
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const initialValuesGroups = {
  groupId: "",
  secretPasscode: "",
}

const Form = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const joinGroup = async (values, onSubmitProps) => {
    const formData = new FormData();
    formData.append("userId", _id);
    for (let value in values) {
      formData.append(value, values[value]);
    }
    let groupId = null;
    let secretPasscode = null;
    for (let pair of formData.entries()) {
      if (pair[0] === 'groupId') {
        groupId = pair[1];
      }
      if (pair[0] === 'secretPasscode') {
        secretPasscode = pair[1];
      }
    }

    const savedUserResponse = await fetch(
      `http://localhost:3001/groups/${groupId}/${secretPasscode}/join/${_id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const savedGroup = await savedUserResponse.json();
    onSubmitProps.resetForm();
    if (savedGroup) {
      navigate("/groups");
    }
  }

  const handleFormSubmit = async (values, onSubmitProps) => {
    await joinGroup(values, onSubmitProps);
  }

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValuesGroups}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            <TextField
              label="Group Id"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.groupId}
              name="groupId"
              error={Boolean(touched.groupId) && Boolean(errors.groupId)}
              helperText={touched.groupId && errors.groupId}
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Secret Passcode"
              type="password"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.secretPasscode}
              name="secretPasscode"
              error={Boolean(touched.secretPasscode) && Boolean(errors.secretPasscode)}
              helperText={touched.secretPasscode && errors.secretPasscode}
              sx={{ gridColumn: "span 4" }}
            />
          </Box>
          <Box mt={2}>
            <Button
              fullWidth
              type="submit"
              sx={{
                p: "1rem",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              Join Group
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;
