import { supabase } from './client';

/**
 * Delete an update from the database.
 * Note: Storage files are automatically deleted by Supabase Edge Functions/Webhooks.
 */
export async function deleteUpdate(updateId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('updates')
            .delete()
            .eq('id', updateId);

        if (error) {
            console.error('Error deleting update from database:', error);
            return false;
        }

        console.log('Update deleted successfully:', updateId);
        return true;
    } catch (error) {
        console.error('Exception in deleteUpdate:', error);
        return false;
    }
}

/**
 * Delete a PDF from the database.
 * Note: Storage files are automatically deleted by Supabase Edge Functions/Webhooks.
 */
export async function deletePdf(pdfId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('pdfs')
            .delete()
            .eq('id', pdfId);

        if (error) {
            console.error('Error deleting PDF from database:', error);
            return false;
        }

        console.log('PDF deleted successfully:', pdfId);
        return true;
    } catch (error) {
        console.error('Exception in deletePdf:', error);
        return false;
    }
}

/**
 * Delete a tool from the database.
 * Note: Storage files are automatically deleted by Supabase Edge Functions/Webhooks.
 */
export async function deleteTool(toolId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('tools')
            .delete()
            .eq('id', toolId);

        if (error) {
            console.error('Error deleting tool from database:', error);
            return false;
        }

        console.log('Tool deleted successfully:', toolId);
        return true;
    } catch (error) {
        console.error('Exception in deleteTool:', error);
        return false;
    }
}
