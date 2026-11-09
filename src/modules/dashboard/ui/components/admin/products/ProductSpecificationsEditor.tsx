"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {Pencil, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getAttributeValueChoices} from "@/services/attributeCatalogService";
import {
    getProductSpecificationWorkspace,
    removeProductSpecification,
    setProductSpecification
} from "@/services/productSpecificationService";
import type {AttributeValueVm} from "@/common/schemas/attributeCatalog";
import {getErrorMessage} from "@/lib/utils";

type Workspace = Extract<Awaited<ReturnType<typeof getProductSpecificationWorkspace>>, { success: true }>["data"];

interface Props {
    productId: string;
    categoryId: number | null;
    expectedVersion: number;
    status: string;
    disabled: boolean;
    onBusyChange: (busy: boolean) => void;
    onReload: () => Promise<void>;
}

export function ProductSpecificationsEditor({
                                                productId,
                                                categoryId,
                                                expectedVersion,
                                                status,
                                                disabled,
                                                onBusyChange,
                                                onReload
                                            }: Props) {
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [attributeId, setAttributeId] = useState("");
    const [valueId, setValueId] = useState("");
    const [values, setValues] = useState<AttributeValueVm[]>([]);
    const [loadingValues, setLoadingValues] = useState(false);
    const [valuesError, setValuesError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [needsReload, setNeedsReload] = useState(false);
    const [removeId, setRemoveId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setWorkspace(null);
        setLoadError(null);
        setAttributeId("");
        setRemoveId(null);
        setNeedsReload(false);
        getProductSpecificationWorkspace(productId, categoryId).then((result) => {
            if (cancelled) return;
            if (result.success) setWorkspace(result.data);
            else setLoadError(result.message);
        }).catch((cause: unknown) => {
            if (!cancelled) setLoadError(getErrorMessage(cause));
        });
        return () => {
            cancelled = true;
        };
    }, [productId, categoryId, expectedVersion, retry]);

    useEffect(() => {
        let cancelled = false;
        setValues([]);
        setValueId("");
        setValuesError(null);
        if (!attributeId) {
            setLoadingValues(false);
            return;
        }
        setLoadingValues(true);
        getAttributeValueChoices(attributeId).then((result) => {
            if (cancelled) return;
            if (!result.success) {
                setValuesError(result.message);
            } else if (result.data.definition.status !== "ACTIVE") {
                setValuesError("This attribute is inactive. Reload the latest product.");
            } else {
                setValues(result.data.values);
                setValueId(workspace?.specifications.find((entry) => entry.attribute.id === attributeId)?.value.id ?? "");
            }
        }).catch((cause: unknown) => {
            if (!cancelled) setValuesError(getErrorMessage(cause));
        }).finally(() => {
            if (!cancelled) setLoadingValues(false);
        });
        return () => {
            cancelled = true;
        };
    }, [attributeId, workspace]);

    const stale = needsReload || (workspace !== null && workspace.version !== expectedVersion);
    const locked = disabled || busy || stale || status === "DELETED" || !workspace;
    const policies = [...(workspace?.policies ?? [])].sort((a, b) => a.policy.displayOrder - b.policy.displayOrder);
    const usable = policies.filter((entry) => entry.policy.usable);
    const currentValue = workspace?.specifications.find((entry) => entry.attribute.id === attributeId)?.value.id;

    async function mutate(action: "save" | "remove", targetId: string) {
        if (locked) return;
        setBusy(true);
        onBusyChange(true);
        setError(null);
        setNotice(null);
        try {
            const result = action === "save"
                ? await setProductSpecification(productId, targetId, valueId, expectedVersion)
                : await removeProductSpecification(productId, targetId, expectedVersion);
            if (!result.success) {
                setError(result.message);
                if (result.conflict) setNeedsReload(true);
                return;
            }
            setNotice(action === "save" ? "Specification saved." : "Specification removed.");
            setNeedsReload(true);
            setRemoveId(null);
            await onReload();
            setRetry((count) => count + 1);
        } catch (cause: unknown) {
            setError(getErrorMessage(cause));
        } finally {
            setBusy(false);
            onBusyChange(false);
        }
    }

    async function reload() {
        setBusy(true);
        onBusyChange(true);
        setError(null);
        try {
            await onReload();
            setRetry((count) => count + 1);
        } catch (cause: unknown) {
            setError(getErrorMessage(cause));
        } finally {
            setBusy(false);
            onBusyChange(false);
        }
    }

    return (
        <section className="space-y-4 rounded-lg border p-4" aria-labelledby="product-specifications-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id="product-specifications-heading" className="font-semibold">Specifications</h3>
                <Button type="button" variant="outline" size="sm" disabled={disabled || busy} onClick={reload}>Reload
                    specifications</Button>
            </div>
            <p className="text-sm text-muted-foreground">Set one fixed value per attribute. An attribute already used by
                a purchase option cannot also be a fixed specification. Required attributes must be complete when the
                product is ACTIVE.</p>
            {disabled &&
                <p className="text-sm text-muted-foreground">Save or discard product detail changes and finish other
                    operations before editing specifications.</p>}
            {categoryId === null &&
                <p className="text-sm">Save a category on this product before adding specifications.</p>}
            {status === "DELETED" && <p className="text-sm">Specifications of deleted products are read-only.</p>}
            {categoryId !== null && <Link href={`/dashboard/admin/categories/${categoryId}/attributes`}
                                          className="inline-block text-sm underline">Manage category attributes</Link>}
            {loadError ? <p role="alert" className="text-sm text-destructive">{loadError}</p> : !workspace &&
                <p role="status" className="text-sm">Loading specifications...</p>}
            {stale &&
                <p role="alert" className="text-sm text-destructive">The product has changed. Reload the latest product
                    before editing specifications.</p>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {notice && <p role="status" className="text-sm">{notice}</p>}
            {workspace && <>
                {workspace.specifications.length === 0 ?
                    <p className="text-sm text-muted-foreground">No fixed specifications yet.</p> : (
                        <ul className="divide-y">
                            {workspace.specifications.map(({attribute, value}) => {
                                const policy = policies.find((entry) => entry.attribute.id === attribute.id)?.policy;
                                const confirming = removeId === attribute.id;
                                return <li key={attribute.id} className="space-y-2 py-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                                <span>{attribute.displayName}</span>
                                                {policy?.required && <Badge variant="secondary">Required</Badge>}
                                            </div>
                                            <p className="text-sm">{value.displayName}</p>
                                            {!policy?.usable &&
                                                <p className="text-xs text-muted-foreground">Unavailable for new
                                                    assignments</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm"
                                                    disabled={locked || !policy?.usable}
                                                    aria-label={`Edit ${attribute.displayName}`} onClick={() => {
                                                setAttributeId(attribute.id);
                                                setRemoveId(null);
                                            }}><Pencil className="mr-1 h-4 w-4"/>Edit</Button>
                                            <Button type="button" variant="outline" size="sm" disabled={locked}
                                                    aria-label={`Remove ${attribute.displayName}`}
                                                    onClick={() => setRemoveId(attribute.id)}><Trash2
                                                className="mr-1 h-4 w-4"/>Remove</Button>
                                        </div>
                                    </div>
                                    {confirming && <div className="space-y-2 rounded-md border p-3">
                                        <p className="text-sm">Remove {attribute.displayName}? Removal is rejected if an
                                            ACTIVE product would lose a required attribute.</p>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="destructive" size="sm" disabled={locked}
                                                    onClick={() => mutate("remove", attribute.id)}>Confirm
                                                removal</Button>
                                            <Button type="button" variant="outline" size="sm" disabled={busy}
                                                    onClick={() => setRemoveId(null)}>Cancel</Button>
                                        </div>
                                    </div>}
                                </li>;
                            })}
                        </ul>
                    )}
                {usable.length === 0 ?
                    <p className="text-sm text-muted-foreground">No active attributes are enabled for this
                        category.</p> : <div className="space-y-3 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="specification-attribute">Attribute</Label>
                            <Select value={attributeId} onValueChange={setAttributeId} disabled={locked}>
                                <SelectTrigger id="specification-attribute"><SelectValue
                                    placeholder="Select an attribute"/></SelectTrigger>
                                <SelectContent>{usable.map(({attribute, policy}) => <SelectItem key={attribute.id}
                                                                                                value={attribute.id}>{attribute.displayName}{attribute.canonicalUnit ? ` (${attribute.canonicalUnit})` : ""}{policy.required ? " · Required" : ""}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {attributeId && <div className="space-y-2">
                            <Label htmlFor="specification-value">Value</Label>
                            <Select value={valueId} onValueChange={setValueId}
                                    disabled={locked || loadingValues || !!valuesError || values.length === 0}>
                                <SelectTrigger id="specification-value"><SelectValue
                                    placeholder={loadingValues ? "Loading values..." : "Select a value"}/></SelectTrigger>
                                <SelectContent>{values.map((value) => <SelectItem key={value.id}
                                                                                  value={value.id}>{value.displayName}</SelectItem>)}</SelectContent>
                            </Select>
                            {valuesError && <p role="alert" className="text-sm text-destructive">{valuesError}</p>}
                            {!loadingValues && !valuesError && values.length === 0 &&
                                <p className="text-sm text-muted-foreground">No values exist for this attribute.</p>}
                            <Link href={`/dashboard/admin/attributes/${attributeId}`}
                                  className="inline-block text-sm underline">Manage attribute values</Link>
                        </div>}
                        <Button type="button"
                                disabled={locked || loadingValues || !!valuesError || !valueId || !values.some((value) => value.id === valueId) || currentValue === valueId}
                                onClick={() => mutate("save", attributeId)}>{busy ? "Saving..." : currentValue ? "Update specification" : "Add specification"}</Button>
                    </div>}
            </>}
        </section>
    );
}
