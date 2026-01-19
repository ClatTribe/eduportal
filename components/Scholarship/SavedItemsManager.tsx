import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
// import { supabase } from '../../lib/supabase';

export const useSavedItems = (userId: string | undefined, itemType: 'scholarship' | 'course') => {
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (userId) {
      loadSavedItems();
    }
  }, [userId]);

  const loadSavedItems = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("shortlist_builder")
        .select("scholarship_id, course_id")
        .eq("user_id", userId)
        .eq("item_type", itemType);

      if (error) {
        console.error("Error loading saved items:", error);
        return;
      }

      if (data) {
        const itemIds = new Set(
          data
            .map((item) => itemType === 'scholarship' ? item.scholarship_id : item.course_id)
            .filter(Boolean)
        );
        setSavedItems(itemIds);
      }
    } catch (error) {
      console.error("Error loading saved items:", error);
    }
  };

  const toggleSaveItem = async (itemId: number) => {
    if (!userId) {
      alert("Please login to save items");
      return;
    }

    try {
      const isSaved = savedItems.has(itemId);

      if (isSaved) {
        const deleteQuery = supabase
          .from("shortlist_builder")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", itemType);

        if (itemType === 'scholarship') {
          deleteQuery.eq("scholarship_id", itemId);
        } else {
          deleteQuery.eq("course_id", itemId);
        }

        const { error } = await deleteQuery;
        if (error) throw error;

        setSavedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        const insertData: any = {
          user_id: userId,
          item_type: itemType,
          status: "interested",
        };

        if (itemType === 'scholarship') {
          insertData.scholarship_id = itemId;
        } else {
          insertData.course_id = itemId;
        }

        const { error } = await supabase.from("shortlist_builder").insert(insertData);
        if (error) throw error;

        setSavedItems((prev) => new Set([...prev, itemId]));
      }
    } catch (error) {
      console.error("Error toggling saved item:", error);
      alert("Failed to update shortlist. Please try again.");
    }
  };

  return { savedItems, toggleSaveItem };
};