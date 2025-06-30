import {
  CoreV1Api,
  KubeConfig,
  NetworkingV1Api,
  AppsV1Api,
} from "@kubernetes/client-node";

const kc = new KubeConfig();
kc.loadFromDefault();

const coreV1Api = kc.makeApiClient(CoreV1Api);
const networkingV1Api = kc.makeApiClient(NetworkingV1Api);
const appsV1Api = kc.makeApiClient(AppsV1Api);

export const createPlayground = async (
  name: string,
  environment: string,
  port: number,
) => {
  let CONTAINER_IMAGE = "";

  if (environment === "reactjs") {
    CONTAINER_IMAGE = "tarunclub/tensor-react-playground-env:1.0.0";
  } else if (environment === "nodejs") {
    CONTAINER_IMAGE = "tarunclub/tensor-nodejs-playground-env:1.0.0";
  } else {
    throw new Error(`Unsupported environment: ${environment}`);
  }

  console.log(
    `Creating deployment for ${name} with image ${CONTAINER_IMAGE} on port ${port}`,
  );

  const deployment = {
    metadata: {
      name: name,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: name,
        },
      },
      template: {
        metadata: {
          labels: {
            app: name,
          },
        },
        spec: {
          containers: [
            {
              name: name,
              image: CONTAINER_IMAGE,
              ports: [
                { containerPort: port },
                { containerPort: 5001 },
              ],
            },
          ],
        },
      },
    },
  };

  const service = {
    metadata: {
      name: `${name}-service`,
    },
    spec: {
      selector: {
        app: name,
      },
      ports: [
        {
          name: "app",
          port: port,
          targetPort: port,
        },
        {
          name: "api",
          port: 5001,
          targetPort: 5001,
        },
      ],
    },
  };

  const ingress = {
    metadata: {
      name: `${name}-ingress`,
    },
    spec: {
      rules: [
        {
          host: `app.${name}.localhost`,
          http: {
            paths: [
              {
                pathType: "Prefix",
                path: "/",
                backend: {
                  service: {
                    name: `${name}-service`,
                    port: {
                      number: port,
                    },
                  },
                },
              },
            ],
          },
        },
        {
          host: `api.${name}.localhost`,
          http: {
            paths: [
              {
                pathType: "Prefix",
                path: "/",
                backend: {
                  service: {
                    name: `${name}-service`,
                    port: {
                      number: 5001,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  try {
    const createdDeployment = await appsV1Api.createNamespacedDeployment(
      {
        namespace: "default",
        body: deployment,
      }
    );

    const createdService = await coreV1Api.createNamespacedService(
      {
        namespace: "default",
        body: service,
      }
    );

    const createdIngress = await networkingV1Api.createNamespacedIngress(
        {
            namespace: "default",
            body: ingress,
        }
    );

    console.log("Created Deployment:", createdDeployment.metadata?.creationTimestamp);
    console.log("Created Service:", createdService.metadata?.creationTimestamp);
    console.log("Created Ingress:", createdIngress.metadata?.name);
  } catch (err) {
    console.error("Error creating playground resources:", err);
  }
};
