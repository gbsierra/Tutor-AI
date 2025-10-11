// frontend/src/hooks/useModules.ts
import { useEffect, useRef, useState } from "react";
import { ModuleService } from "../services/moduleService"
import type { TModuleSpec } from "@shared/module"

type AsyncState<T> = { data?: T; loading: boolean; error?: string };
const modulesCache = new Map<string, TModuleSpec>();
let listCache: TModuleSpec[] | undefined;

export function useModulesList() {
  const [state, setState] = useState<AsyncState<TModuleSpec[]>>({
    data: listCache,
    loading: !listCache,
  });

  useEffect(() => {
    let alive = true;
    if (!listCache) {
      ModuleService.listModules()
        .then((mods) => {
          if (!alive) return;
          listCache = mods;
          // warm detail cache
          for (const m of mods) modulesCache.set(m.slug, m);
          setState({ data: mods, loading: false });
        })
        .catch((e: any) => {
          if (!alive) return;
          setState({ loading: false, error: e?.message || String(e) });
        });
    }
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function useModule(slug: string | undefined) {
  const [state, setState] = useState<AsyncState<TModuleSpec>>({
    data: slug ? modulesCache.get(slug) : undefined,
    loading: !!slug && !modulesCache.has(slug),
  });

  const prevSlug = useRef<string | undefined>(slug);
  useEffect(() => {
    if (!slug) return;
    // slug changed
    if (prevSlug.current !== slug) {
      prevSlug.current = slug;
      const cached = modulesCache.get(slug);
      setState({ data: cached, loading: !cached });
    }

    if (!modulesCache.has(slug)) {
      let alive = true;
      ModuleService.getModule(slug)
        .then((mod) => {
          if (!alive) return;
          modulesCache.set(slug, mod);
          setState({ data: mod, loading: false });
        })
        .catch((e: any) => {
          if (!alive) return;
          setState({ loading: false, error: e?.message || String(e) });
        });
      return () => {
        alive = false;
      };
    }
  }, [slug]);

  return state;
}

export function useModuleReview(moduleSlug: string | undefined) {
  const [state, setState] = useState<AsyncState<any>>({
    loading: !!moduleSlug,
  });

  useEffect(() => {
    if (!moduleSlug) return;
    
    let alive = true;
    
    // Use a more robust approach - retry if API client not initialized
    const fetchData = async () => {
      try {
        const { getModuleReviewData } = await import("../services/problemService");
        const data = await getModuleReviewData(moduleSlug);
        if (!alive) return;
        setState({ data, loading: false });
      } catch (e: any) {
        if (!alive) return;
        
        // If API client not initialized, retry after a short delay
        if (e?.message?.includes('API client not initialized')) {
          console.log('API client not ready, retrying in 200ms...');
          setTimeout(fetchData, 200);
          return;
        }
        
        setState({ loading: false, error: e?.message || String(e) });
      }
    };
    
    fetchData();

    return () => { alive = false; };
  }, [moduleSlug]);

  return state;
}
