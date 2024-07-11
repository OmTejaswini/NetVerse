import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Dropzone from "react-dropzone";

const groupSchema = yup.object().shape({
  groupName: yup.string().required("required"),
  description: yup.string().required("required"),
  secretPasscode: yup.string(),
  picturePath: yup.string()
})

const initialValuesGroups = {
  groupName: "",
  description: "",
  secretPasscode: "",
  picturePath: ""
}

const Form = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const createGroup = async (values, onSubmitProps) => {
    const formData = new FormData();
    formData.append("userId", _id);
    for (let value in values) {
      formData.append(value, values[value]);
    }
    if(values.picture){
      formData.append("picturePath", values.picture.name);
    }

    const savedUserResponse = await fetch(
      "http://localhost:3001/groups/create",
      {
        method: "POST",
        headers: {Authorization: `Bearer ${token}`},
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
    await createGroup(values, onSubmitProps);
  }

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValuesGroups}
      validationSchema={groupSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
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
              label="Group Name"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.groupName}
              name="groupName"
              error={Boolean(touched.groupName) && Boolean(errors.groupName)}
              helperText={touched.groupName && errors.groupName}
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Description"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.description}
              name="description"
              error={Boolean(touched.description) && Boolean(errors.description)}
              helperText={touched.description && errors.description}
              sx={{ gridColumn: "span 4" }}
            />
            <Box
              gridColumn="span 4"
              border={`1px solid ${theme.palette.neutral.medium}`}
              borderRadius="5px"
              p="1rem"
            >
              <Dropzone
                acceptedFiles=".jpg,.jpeg,.png"
                multiple={false}
                onDrop={(acceptedFiles) =>
                  setFieldValue("picture", acceptedFiles[0])
                }
              >
                {({ getRootProps, getInputProps }) => (
                  <Box
                    {...getRootProps()}
                    border={`2px dashed ${theme.palette.primary.main}`}
                    p="1rem"
                    sx={{ "&:hover": { cursor: "pointer" } }}
                  >
                    <input {...getInputProps()} />
                    {!values.picture ? (
                      <Typography>Add Picture Here</Typography>
                    ) : (
                      <Box display="flex" justifyContent="space-between">
                        <Typography>{values.picture.name}</Typography>
                        <EditOutlinedIcon />
                      </Box>
                    )}
                  </Box>
                )}
              </Dropzone>
            </Box>
            <TextField
              label="Secret Passcode"
              type="text"
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
              Create Group
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;
