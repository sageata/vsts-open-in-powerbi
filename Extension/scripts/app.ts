namespace SupportedActions {
    export const OpenItems = "OpenItems";
    export const OpenQuery = "OpenQuery";
}

namespace WellKnownQueries {
    export const AssignedToMe = "A2108D31-086C-4FB0-AFDA-097E4CC46DF4";
    export const UnsavedWorkItems = "B7A26A56-EA87-4C97-A504-3F028808BB9F";
    export const FollowedWorkItems = "202230E0-821E-401D-96D1-24A7202330D0";
    export const CreatedBy = "53FB153F-C52C-42F1-90B6-CA17FC3561A8";
    export const SearchResults = "2CBF5136-1AE5-4948-B59A-36F526D9AC73";
    export const CustomWiql = "08E20883-D56C-4461-88EB-CE77C0C7936D";
    export const RecycleBin = "2650C586-0DE4-4156-BA0E-14BCFB664CCA";
}

export var queryExclusionList = [
    WellKnownQueries.AssignedToMe,
    WellKnownQueries.UnsavedWorkItems,
    WellKnownQueries.FollowedWorkItems,
    WellKnownQueries.CreatedBy,
    WellKnownQueries.SearchResults,
    WellKnownQueries.CustomWiql,
    WellKnownQueries.RecycleBin];

export function isSupportedQueryId(queryId: string) {
    return queryId && queryExclusionList.indexOf(queryId.toUpperCase()) === -1;
}

export interface IQueryObject {
    id: string;
    isPublic: boolean;
    name: string;
    path: string;
    wiql: string;
}

export interface IActionContext {
    id?: number;            // From card
    workItemId?: number;    // From work item form
    query?: IQueryObject;
    queryText?: string;
    ids?: number[];
    workItemIds?: number[]; // From backlog/iteration (context menu) and query results (toolbar and context menu)
    columns?: string[];
}

export interface IDialogConfiguration {
    close: () => void;
    hostUrl: string;
    projectName: string;
    qid: string;
}

export var openQueryAction = {
    getMenuItems: (context: any) => {
        if (!context || !context.query || !context.query.wiql || !isSupportedQueryId(context.query.id)) {
            return null;
        }
        else {
            return [<IContributedMenuItem>{
                title: "Open in Power BI",
                text: "Open in Power BI",
                icon: "img/powerbi_logo_16x16.png",
                action: (actionContext: IActionContext) => {
                    if (actionContext && actionContext.query && actionContext.query.id) {
                        let context = VSS.getWebContext();

                        showNotification({
                            close: null,
                            hostUrl: context.host.uri,
                            projectName: context.project.name,
                            qid: actionContext.query.id
                        });
                    }
                }
            }];
        }
    }
};

export var openQueryOnToolbarAction = {
    getMenuItems: (context: any) => {
        return [<IContributedMenuItem>{
            title: "Open in Power BI",
            text: "Open in Power BI",
            icon: "img/powerbi_logo_16x16.png",
            showText: true,
            action: (actionContext: IActionContext) => {
                if (actionContext && actionContext.query && actionContext.query.wiql && isSupportedQueryId(actionContext.query.id)) {
                    let context = VSS.getWebContext();

                    showNotification({
                        close: null,
                        hostUrl: context.host.uri,
                        projectName: context.project.name,
                        qid: actionContext.query.id
                    });
                }
                else {
                    VSS.getService(VSS.ServiceIds.Dialog).then((hostDialogService: IHostDialogService) => {
                        hostDialogService.openMessageDialog(
                            "In order to open query please save it first in \"My Queries\" or \"Shared Queries\".",
                            {
                                title: "Unable to perform this operation",
                                buttons: [
                                    {
                                        id: "ok",
                                        text: "OK"
                                    }
                                ]
                            });
                    });
                }
            }
        }];
    }
};

function showNotification(configuration: IDialogConfiguration) {
    let extensionContext = VSS.getExtensionContext();
    let dialog: IExternalDialog;

    configuration.close = () => dialog.close();

    VSS.getService(VSS.ServiceIds.Dialog).then((hostDialogService: IHostDialogService) => {
        hostDialogService.openDialog(`${extensionContext.publisherId}.${extensionContext.extensionId}.notificationDialog`,
            {
                title: "Downloading Power BI file...",
                width: 400,
                height: 670,
                modal: true,
                draggable: false,
                resizable: false,
                buttons: {
                    "ok": {
                        id: "ok",
                        text: "Dismiss",
                        click: () => {
                            dialog.close();
                        },
                        class: "cta",
                    }
                }
            },
            configuration)
            .then(d => {
                dialog = d
            });
    });
}
