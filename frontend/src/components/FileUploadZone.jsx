import React, {
  useState,
  useRef,
} from "react";

import {
  UploadCloud,
  File,
  X,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

import apiClient from "../utils/client";

import { ENDPOINTS } from "../utils/endpoints";

export default function FileUploadZone({
  source,
  onCancel,
  onUploadSuccess,
}) {

  const [file,
    setFile] =
      useState(null);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    estimatedRows,
    setEstimatedRows,
  ] = useState(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [progress,
    setProgress] =
      useState(0);

  const fileInputRef =
    useRef(null);

  const handleFile = (f) => {

    setFile(f);

    if (
      f &&
      (
        f.name.endsWith(".csv") ||
        f.name.endsWith(".txt")
      )
    ) {

      const reader =
        new FileReader();

      reader.onload = (e) =>

        setEstimatedRows(
          e.target.result
            .split("\n").length - 1
        );

      reader.readAsText(f);

    } else {

      setEstimatedRows(null);
    }
  };

  const handleDrop = (e) => {

    e.preventDefault();

    setIsDragging(false);

    if (
      e.dataTransfer.files?.length
    ) {

      handleFile(
        e.dataTransfer.files[0]
      );
    }
  };

  const handleUpload =
    async () => {

      if (!file) return;

      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "source_type",
        source.id
      );

      formData.append(
        "file",
        file
      );

      try {

        const res =
          await apiClient.post(
            ENDPOINTS.JOBS,
            formData,

            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },

              onUploadProgress:
                (
                  progressEvent
                ) => {

                  if (
                    progressEvent.total
                  ) {

                    setProgress(
                      Math.round(
                        (
                          progressEvent.loaded *
                          100
                        ) /
                        progressEvent.total
                      )
                    );
                  }
                },
            }
          );

        onUploadSuccess(
          res.data.id
        );

      } catch (err) {

        alert(
          "Upload failed: " +
          (
            err.response?.data
              ?.error ||
            err.message
          )
        );

        setUploading(false);
      }
    };

  return (
    <div className="
      space-y-6
    ">

      {/* Header */}

      <div className="
        flex items-start justify-between
        gap-4
      ">

        <div>

          <h2 className="
            text-2xl
            font-bold
            text-slate-900
            mb-2
          ">
            Upload Dataset
          </h2>

          <p className="
            text-sm
            text-slate-500
            leading-relaxed
          ">
            Upload and validate{" "}
            <span className="
              font-semibold
              text-slate-700
            ">
              {source.title}
            </span>{" "}
            files for ESG ingestion processing.
          </p>
        </div>

        <button
          onClick={onCancel}

          className="
            w-11 h-11
            rounded-2xl

            border border-slate-200
            bg-white

            flex items-center justify-center

            text-slate-500
            hover:text-slate-900
            hover:bg-slate-100

            transition-all
          "
        >
          <X size={18} />
        </button>
      </div>

      {/* Upload Zone */}

      {!file ? (

        <div
          onDragOver={(e) => {

            e.preventDefault();

            setIsDragging(true);
          }}

          onDragLeave={() =>
            setIsDragging(false)
          }

          onDrop={handleDrop}

          onClick={() =>
            fileInputRef.current?.click()
          }

          className={`
            relative
            overflow-hidden

            border-2 border-dashed

            rounded-[2rem]

            p-14

            cursor-pointer

            transition-all duration-300

            ${
              isDragging

                ? `
                  border-blue-500
                  bg-blue-50
                  shadow-2xl
                  shadow-blue-500/10
                  scale-[1.01]
                `

                : `
                  border-slate-200
                  bg-white
                  hover:border-blue-300
                  hover:bg-slate-50
                `
            }
          `}
        >

          {/* Glow */}

          <div className="
            absolute inset-0
            bg-gradient-to-br
            from-blue-500/5
            to-cyan-500/5
          "></div>

          <input
            type="file"

            className="hidden"

            ref={fileInputRef}

            onChange={(e) =>
              handleFile(
                e.target.files[0]
              )
            }

            accept={source.formats}
          />

          <div className="
            relative z-10
            flex flex-col
            items-center
            text-center
          ">

            <div className="
              w-24 h-24

              rounded-[2rem]

              bg-gradient-to-br
              from-blue-600
              to-cyan-500

              text-white

              flex items-center justify-center

              shadow-2xl
              shadow-blue-500/20

              mb-8
            ">

              <UploadCloud
                size={42}
              />
            </div>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
              mb-3
            ">
              Drag & Drop Dataset
            </h3>

            <p className="
              text-slate-500
              max-w-lg
              leading-relaxed
              mb-6
            ">
              Drop your ESG ingestion file here
              or browse locally to begin parser processing.
            </p>

            <div className="
              inline-flex
              items-center gap-2

              px-4 py-2

              rounded-full

              bg-slate-100

              text-sm
              font-medium
              text-slate-700
            ">

              <FileSpreadsheet
                size={16}
              />

              <span>
                Supported: {source.formats}
              </span>
            </div>
          </div>
        </div>

      ) : (

        <div className="
          bg-white
          border border-slate-200
          rounded-[2rem]
          p-7
          shadow-sm
        ">

          <div className="
            flex items-start gap-5
          ">

            {/* File Icon */}

            <div className="
              w-16 h-16

              rounded-3xl

              bg-blue-50
              text-blue-600

              flex items-center justify-center

              ring-8 ring-blue-100
            ">

              <File size={28} />
            </div>

            {/* File Info */}

            <div className="
              flex-1 min-w-0
            ">

              <div className="
                flex items-start justify-between
                gap-4
              ">

                <div className="
                  min-w-0
                ">

                  <h3
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                      truncate
                    "

                    title={file.name}
                  >
                    {file.name}
                  </h3>

                  <div className="
                    flex flex-wrap
                    items-center gap-4
                    mt-2
                  ">

                    <span className="
                      text-sm
                      text-slate-500
                    ">
                      {(
                        file.size /
                        1024
                      ).toFixed(1)} KB
                    </span>

                    {estimatedRows && (

                      <span className="
                        inline-flex
                        items-center gap-2

                        text-sm
                        text-emerald-600
                        font-medium
                      ">

                        <CheckCircle2
                          size={15}
                        />

                        ~{estimatedRows} rows detected
                      </span>
                    )}
                  </div>
                </div>

                {!uploading && (

                  <button
                    onClick={() =>
                      setFile(null)
                    }

                    className="
                      w-10 h-10

                      rounded-2xl

                      border border-slate-200

                      bg-white

                      text-slate-500
                      hover:text-red-500
                      hover:bg-red-50

                      flex items-center justify-center

                      transition-all
                    "
                  >

                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Progress */}

              {uploading && (

                <div className="
                  mt-7
                ">

                  <div className="
                    flex items-center justify-between
                    mb-3
                  ">

                    <div className="
                      flex items-center gap-2
                    ">

                      <Loader2
                        size={16}
                        className="
                          animate-spin
                          text-blue-600
                        "
                      />

                      <span className="
                        text-sm
                        font-medium
                        text-slate-700
                      ">
                        Uploading & Processing...
                      </span>
                    </div>

                    <span className="
                      text-sm
                      font-bold
                      text-blue-600
                    ">
                      {progress}%
                    </span>
                  </div>

                  <div className="
                    w-full
                    h-3

                    rounded-full

                    bg-slate-100
                    overflow-hidden
                  ">

                    <div
                      className="
                        h-full

                        rounded-full

                        bg-gradient-to-r
                        from-blue-600
                        to-cyan-500

                        transition-all duration-300
                      "

                      style={{
                        width:
                          `${progress}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}

      <div className="
        flex flex-col sm:flex-row
        gap-4
      ">

        <button
          onClick={onCancel}

          disabled={uploading}

          className="
            flex-1

            border border-slate-200

            bg-white

            hover:bg-slate-100

            text-slate-700

            py-4
            rounded-2xl

            font-semibold

            transition-all

            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          onClick={handleUpload}

          disabled={!file || uploading}

          className="
            flex-1

            bg-gradient-to-r
            from-blue-600
            to-cyan-500

            hover:opacity-90

            text-white

            py-4
            rounded-2xl

            font-semibold

            flex items-center justify-center gap-3

            shadow-xl shadow-blue-500/20

            transition-all

            disabled:opacity-50
          "
        >

          {uploading ? (

            <>
              <Loader2
                size={18}
                className="
                  animate-spin
                "
              />

              <span>
                Processing Dataset...
              </span>
            </>

          ) : (

            <>
              <UploadCloud
                size={18}
              />

              <span>
                Upload & Process
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}