"use strict";

const swagger = require("../../");
const expect = require("chai").expect;
const specs = require("../fixtures/specs");
const helper = require("../fixtures/helper");
const fs = require("fs");

for (let spec of specs) {
  describe(`FileServer middleware (${spec.name})`, () => {
    ["head", "get"].forEach((method) => {
      describe(method.toUpperCase(), () => {
        let isHead;

        beforeEach(() => {
          isHead = method === "head";
        });

        describe("dereferenced JSON file", () => {
          it("should serve the fully-dereferenced JSON API", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done));
            });
          });

          it("should not serve the fully-dereferenced JSON API if `apiPath` is falsy", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ apiPath: "" }));

              helper.supertest(express)
                [method]("/")
                .expect(404)
                .end(done);
            });
          });

          it("should not serve the fully-dereferenced JSON API if `apiPath` is falsy", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ apiPath: "" }));

              helper.supertest(express)
                [method]("/")
                .expect(404)
                .end(done);
            });
          });

          it("should use the path specified in `apiPath`", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ apiPath: "/my/custom/path" }));

              helper.supertest(express)
                [method]("/my/custom/path")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done));
            });
          });

          it("should use the path specified in `apiPath`", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ apiPath: "/my/custom/path" }));

              helper.supertest(express)
                [method]("/my/custom/path")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done));
            });
          });

          it('should not serve at "/api-docs/" if an alternate path specified is set in the options', (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ apiPath: "/my/custom/path" }));

              helper.supertest(express)
                [method]("/api-docs")
                .expect(404, done);
            });
          });

          it('should prepend the API\'s basePath to "/api-docs/"', (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ useBasePath: true }));

              helper.supertest(express)
                [method]("/api/api-docs/")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done));
            });
          });

          it("should prepend the API's basePath to the custom path", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files({ useBasePath: true, apiPath: "/my/custom/path" }));

              helper.supertest(express)
                [method]("/api/my/custom/path/")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done));
            });
          });

          it("should not use strict routing by default", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/")                                          // <-- trailing slash
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done, () => {

                  helper.supertest(express)
                    [method]("/api-docs")                                   // <-- no trailing slash
                    .expect("Content-Type", "application/json; charset=utf-8")
                    .expect(isHead ? undefined : spec.samples.petStore)
                    .end(helper.checkResults(done));
                }));
            });
          });

          it("should use strict routing if enabled", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(express));

              express.enable("strict routing");
              helper.supertest(express)
                [method]("/api-docs")
                .expect(404)
                .end((err) => {
                  if (err) {
                    return done(err);
                  }

                  express.disable("strict routing");
                  helper.supertest(express)
                    [method]("/api-docs")
                    .expect("Content-Type", "application/json; charset=utf-8")
                    .expect(isHead ? undefined : spec.samples.petStore)
                    .end(helper.checkResults(done));
                });
            });
          });

          it("should use case-sensitive routing if enabled", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(express));

              express.enable("case sensitive routing");
              helper.supertest(express)
                [method]("/API-docs")
                .expect(404)
                .end((err) => {
                  if (err) {
                    return done(err);
                  }

                  express.disable("case sensitive routing");
                  helper.supertest(express)
                    [method]("/API-docs")
                    .expect("Content-Type", "application/json; charset=utf-8")
                    .expect(isHead ? undefined : spec.samples.petStore)
                    .end(helper.checkResults(done));
                });
            });
          });

          it("should use strict, case-sensitive routing, and a custom URL", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(express, { useBasePath: true, apiPath: "/custom/path.json" }));

              express.enable("strict routing");
              express.enable("case sensitive routing");

              helper.supertest(express)
                [method]("/API/Custom/Path.json/")
                .expect(404)
                .end((err) => {
                  if (err) {
                    return done(err);
                  }

                  express.disable("strict routing");
                  express.disable("case sensitive routing");
                  helper.supertest(express)
                    [method]("/API/Custom/Path.json/")
                    .expect("Content-Type", "application/json; charset=utf-8")
                    .expect(isHead ? undefined : spec.samples.petStore)
                    .end(helper.checkResults(done));
                });
            });
          });

          it("should use routing options instead of the Express app's settings", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(
                // These settings will be used instead of the Express App's settings
                { caseSensitive: false, strict: false },
                { useBasePath: true, apiPath: "/custom/path.json" }
              ));

              // The Express App is case-sensitive and strict
              express.enable("strict routing");
              express.enable("case sensitive routing");

              helper.supertest(express)
                [method]("/API/Custom/Path.json/")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(isHead ? undefined : spec.samples.petStore)
                .end(helper.checkResults(done));
            });
          });

          it("should return an HTTP 500 if the Swagger API is invalid", (done) => {
            swagger(spec.files.blank, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs")
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(500, isHead ? undefined : {})
                .end(done);
            });
          });

          it("should not respond to POST requests", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .post("/api-docs")
                .expect(404)
                .end(done);
            });
          });

          it("should not respond to PUT requests", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .put("/api-docs")
                .expect(404)
                .end(done);
            });
          });

          it("should not respond to PATCH requests", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .patch("/api-docs")
                .expect(404)
                .end(done);
            });
          });

          it("should not respond to DELETE requests", (done) => {
            swagger(spec.files.petStore, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .delete("/api-docs")
                .expect(404)
                .end(done);
            });
          });
        });

        describe("raw Swagger files", () => {
          function equalsFile (file) {
            return function (res) {
              if (isHead) {
                if (res.body instanceof Buffer) {
                  expect(res.body).to.have.lengthOf(0);
                }
                else {
                  expect(res.body).to.be.empty;
                }
                expect(res.text || "").to.be.empty;
              }
              else {
                let rawFile = fs.readFileSync(file);
                expect(new Buffer(res.text || res.body)).to.deep.equal(rawFile);
              }

              return false;
            };
          }

          it("should serve the raw Swagger file", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              if (err) {
                return done(err);
              }

              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/external-refs.yaml")
                .expect("Content-Type", "text/yaml; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.externalRefs))
                .end(helper.checkResults(done));
            });
          });

          it("should serve a referenced file in the same directory as the main Swagger file", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/error.json")
                .expect("Content-Type", "application/json; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.error))
                .end(helper.checkResults(done));
            });
          });

          it("should serve a referenced file in a subdirectory of the main Swagger file", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/dir/subdir/text.txt")
                .expect("Content-Type", "text/plain; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.text))
                .end(helper.checkResults(done));
            });
          });

          it("should serve a referenced file in a parent directory of the main Swagger file", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/../pet")
                .expect("Content-Type", "application/octet-stream")
                .expect(200)
                .expect(equalsFile(spec.files.pet))
                .end(helper.checkResults(done));
            });
          });

          it("should serve a referenced file in a parent directory of the main Swagger file", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/../pet")
                .expect("Content-Type", "application/octet-stream")
                .expect(200)
                .expect(equalsFile(spec.files.pet))
                .end(helper.checkResults(done));
            });
          });

          it("should serve a referenced binary file", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/../../1MB.jpg")
                .expect("Content-Type", "image/jpeg")
                .expect(200)
                .expect(equalsFile(spec.files.oneMB))
                .end(helper.checkResults(done));
            });
          });

          it("should not serve the raw Swagger file if the path is falsy", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files({ rawFilesPath: "" }));

              helper.supertest(express)
                [method]("/external-refs.yaml")
                .expect(404)
                .end(done);
            });
          });

          it("should use the path specified in the options", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files({ rawFilesPath: "/my/custom/path/" }));

              helper.supertest(express)
                [method]("/my/custom/path/external-refs.yaml")
                .expect("Content-Type", "text/yaml; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.externalRefs))
                .end(helper.checkResults(done));
            });
          });

          it('should not serve at "/api-docs/" if an alternate path specified is set in the options', (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files({ rawFilesPath: "/my/custom/path" }));

              helper.supertest(express)
                [method]("/api-docs/external-refs.yaml")
                .expect(404, done);
            });
          });

          it('should prepend the API\'s basePath to "/api-docs/"', (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files({ useBasePath: true }));

              helper.supertest(express)
                [method]("/api/v2/api-docs/external-refs.yaml")
                .expect("Content-Type", "text/yaml; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.externalRefs))
                .end(helper.checkResults(done));
            });
          });

          it("should prepend the API's basePath to the custom path", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files({ useBasePath: true, rawFilesPath: "/my/custom/path" }));

              helper.supertest(express)
                [method]("/api/v2/my/custom/path/error.json")
                .expect("Content-Type", "application/json; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.error))
                .end(helper.checkResults(done));
            });
          });

          it("should not use strict routing by default", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                [method]("/api-docs/error.json/")                               // <-- trailing slash
                .expect("Content-Type", "application/json; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.error))
                .end(helper.checkResults(done, (res) => {
                  helper.supertest(express)
                    [method]("/api-docs/error.json")                        // <-- no trailing slash
                    .expect("Content-Type", "application/json; charset=UTF-8")
                    .expect(200)
                    .expect(equalsFile(spec.files.error))
                    .end(helper.checkResults(done));
                }));
            });
          });

          it("should use strict routing if enabled", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(express));

              express.enable("strict routing");
              helper.supertest(express)
                [method]("/api-docs/external-refs.yaml/")
                .expect(404)
                .end((err) => {
                  if (err) {
                    return done(err);
                  }

                  express.disable("strict routing");
                  helper.supertest(express)
                    [method]("/api-docs/external-refs.yaml/")
                    .expect("Content-Type", "text/yaml; charset=UTF-8")
                    .expect(200)
                    .expect(equalsFile(spec.files.externalRefs))
                    .end(helper.checkResults(done));
                });
            });
          });

          it("should use case-sensitive routing if enabled", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(express));

              express.enable("case sensitive routing");
              helper.supertest(express)
                [method]("/API-Docs/External-REFs.yaml")
                .expect(404)
                .end((err) => {
                  if (err) {
                    return done(err);
                  }

                  express.disable("case sensitive routing");
                  helper.supertest(express)
                    [method]("/API-Docs/External-REFs.yaml")
                    .expect("Content-Type", "text/yaml; charset=UTF-8")
                    .expect(200)
                    .expect(equalsFile(spec.files.externalRefs))
                    .end(helper.checkResults(done));
                });
            });
          });

          it("should use strict, case-sensitive routing, and a custom URL", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(express, { useBasePath: true, rawFilesPath: "/custom/path.json" }));

              express.enable("strict routing");
              express.enable("case sensitive routing");
              helper.supertest(express)
                [method]("/Api/V2/Custom/Path.json/Dir/SubDir/Text.TXT/")
                .expect(404)
                .end((err) => {
                  if (err) {
                    return done(err);
                  }

                  express.disable("strict routing");
                  express.disable("case sensitive routing");
                  helper.supertest(express)
                    [method]("/Api/V2/Custom/Path.json/Dir/SubDir/Text.TXT/")
                    .expect("Content-Type", "text/plain; charset=UTF-8")
                    .expect(200)
                    .expect(equalsFile(spec.files.text))
                    .end(helper.checkResults(done));
                });
            });
          });

          it("should use routing options instead of the Express app's settings", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express();
              express.use(middleware.files(
                // These settings will be used instead of the Express App's settings
                { caseSensitive: false, strict: false },
                { useBasePath: true, rawFilesPath: "/custom/path.json" }
              ));

              // The Express App is case-sensitive and strict
              express.enable("strict routing");
              express.enable("case sensitive routing");

              helper.supertest(express)
                [method]("/Api/V2/Custom/Path.json/Dir/SubDir/Text.TXT/")
                .expect("Content-Type", "text/plain; charset=UTF-8")
                .expect(200)
                .expect(equalsFile(spec.files.text))
                .end(helper.checkResults(done));
            });
          });

          it("should not respond to POST requests", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .post("/api-docs/external-refs.yaml")
                .expect(404)
                .end(done);
            });
          });

          it("should not respond to PUT requests", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .put("/api-docs/external-refs.yaml")
                .expect(404)
                .end(done);
            });
          });

          it("should not respond to PATCH requests", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .patch("/api-docs/external-refs.yaml")
                .expect(404)
                .end(done);
            });
          });

          it("should not respond to DELETE requests", (done) => {
            swagger(spec.files.externalRefs, (err, middleware) => {
              let express = helper.express(middleware.files());

              helper.supertest(express)
                .delete("/api-docs/external-refs.yaml")
                .expect(404)
                .end(done);
            });
          });
        });
      });
    });
  });
}
